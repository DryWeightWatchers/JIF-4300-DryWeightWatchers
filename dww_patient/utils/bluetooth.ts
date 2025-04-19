import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

const SERVICE_UUID      = '0000fff0-0000-1000-8000-00805f9b34fb';
const CHAR_RESULTS_UUID = '0000fff1-0000-1000-8000-00805f9b34fb'; 
const CHAR_COMMAND_UUID = '0000fff2-0000-1000-8000-00805f9b34fb'; 

const SCALE_UNIX_OFFSET = 946702800; 

const bleManager = new BleManager();
const permissionList: Permission[] = Platform.OS === 'android'
  ? Platform.Version >= 31
    ? [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
    : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
  : [];

export async function requestBluetoothPermissions(): Promise<boolean> {
  for (const perm of permissionList) {
    let st = await check(perm);
    if (st !== RESULTS.GRANTED) {
      st = await request(perm);
      if (st !== RESULTS.GRANTED) {
        console.warn(`Permission denied: ${perm}`);
        return false;
      }
    }
  }
  return true;
}

export async function connectToScale(
  onWeight: (kg: number) => void,
  scanTimeoutMs = 30000
): Promise<void> {
  if (!(await requestBluetoothPermissions())) {
    throw new Error('Bluetooth permissions not granted');
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve();
    }, scanTimeoutMs);

    bleManager.startDeviceScan(null, null, async (err, device) => {
      if (err) {
        clearTimeout(timeout);
        return reject(err);
      }
      if (device?.name?.match(/Scale|Renpho|ES-/i)) {
        clearTimeout(timeout);
        bleManager.stopDeviceScan();
        try {
          const d = await device.connect();
          await d.discoverAllServicesAndCharacteristics();
          monitorWeight(d, onWeight);
          await sendMeasurementCommands(d);
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    });
  });
}

function monitorWeight(device: Device, onWeight: (kg: number) => void) {
  device.monitorCharacteristicForService(
    SERVICE_UUID,
    CHAR_RESULTS_UUID,
    (_err, char) => {
      if (_err) {
        console.error('Weight monitor error:', _err);
        return;
      }
      const b64 = char?.value;
      if (!b64) return;

      const data = Uint8Array.from(Buffer.from(b64, 'base64'));
      console.log('raw bytes:', data);

      if (data[5] === 0x00) return;

      if (data[0] !== 0x10) return;

      const raw = (data[3] << 8) | data[4];
      const kg  = raw / 100.0;
      console.log('parsed kg:', kg);

      onWeight(kg);
    }
  );
}

async function sendMeasurementCommands(device: Device) {
  const unitPrefix = [0x13, 0x09, 0x15, 0x01, 0x10, 0x00, 0x00, 0x00];
  const checksum = unitPrefix.reduce((sum, v) => sum + v, 0) & 0xFF;
  const unitBuf  = Buffer.from([...unitPrefix, checksum]).toString('base64');
  await device.writeCharacteristicWithResponseForService(
    SERVICE_UUID, CHAR_COMMAND_UUID, unitBuf
  );

  const nowSec = Math.floor(Date.now() / 1000) - SCALE_UNIX_OFFSET;
  const tBuf   = Buffer.alloc(5);
  tBuf.writeUInt8(0x02, 0);
  tBuf.writeUInt32LE(nowSec, 1);
  await device.writeCharacteristicWithResponseForService(
    SERVICE_UUID, CHAR_COMMAND_UUID, tBuf.toString('base64')
  );
}

export function stopScanning() {
  bleManager.stopDeviceScan();
}
