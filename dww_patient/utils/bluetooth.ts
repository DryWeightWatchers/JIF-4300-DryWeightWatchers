
import { BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

// operating system permissions needed to use BLE functionality - platform-dependent 
const permissionList: Permission[] =
    Platform.OS === 'android'
        ? Platform.Version >= 31
            ? [
                PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
                PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            ]
            : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]
        : []; // iOS handled by Info.plist instead (?) 

// used to identify the relevant BLE service and characteristics 
const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const CHAR_RESULTS_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const CHAR_COMMAND_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';

// binary commands to send to the scale 
const START_MEASUREMENT = Buffer.from([
    0x55, 0xaa, 0x90, 0x00, 0x04, 0x01, 0x00, 0x00, 0x00, 0x94,
]).toString('base64');
const DELETE_HISTORY = Buffer.from([
    0x55, 0xaa, 0x95, 0x00, 0x01, 0x01, 0x96,
]).toString('base64');

const bleManager = new BleManager();


export async function requestBluetoothPermissions(): Promise<boolean> {
    for (const permission of permissionList) {
        const result = await check(permission);
        if (result === RESULTS.GRANTED) { continue; }
        const requestResult = await request(permission);
        if (requestResult !== RESULTS.GRANTED) {
            console.warn(`Permission denied: ${permission}`);
            return false;
        }
    }
    return true;
}

export async function connectToScale(
    onWeight: (weight: number) => void, 
    scanTimeoutMs = 60000, 
): Promise<void> {
    const granted = await requestBluetoothPermissions();
    if (!granted) {
        throw new Error('Bluetooth permissions not granted');
    }

    return new Promise<void>((resolve, reject) => {

        // stop scanning after some time to avoid high battery usage 
        const timeoutId = setTimeout(() => {
            bleManager.stopDeviceScan();
            resolve();
        }, scanTimeoutMs);

        bleManager.startDeviceScan(null, null, async (error, device) => {
            if (error) {
                clearTimeout(timeoutId);
                reject(error);
                return;
            }
              
            if (!device?.name?.includes('Scale')) { return; } 
            if (device?.name?.includes('Scale')) {
                console.log("Discovered:", device.name, device.id);
            }
            clearTimeout(timeoutId);
            bleManager.stopDeviceScan();

            try {
                const connectedDevice = await device.connect();
                await connectedDevice.discoverAllServicesAndCharacteristics();
                monitorWeight(connectedDevice, onWeight);  // sets up a listener for weight data 
                await sendMeasurementCommands(connectedDevice); // tells the scale to start sending data 
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
}

function monitorWeight(device: Device, onWeight: (kg: number) => void) {
    device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_RESULTS_UUID,
        (error, characteristic) => {
            if (error) { console.error(error); return; }
            if (!characteristic?.value) return;

            const buffer = Buffer.from(characteristic.value, 'base64');
            const bytes = Uint8Array.from(buffer);

            if (bytes[2] !== 0x14) return; // not a weight response
            if (bytes[5] === 0x00) return;  // not stable yet

            const weightRaw = (bytes[8] << 8) | bytes[9];
            const weightKg = weightRaw / 100.0;
            console.log(weightKg)
            onWeight(weightKg);
        }
    );
}

async function sendMeasurementCommands(device: Device) {
    await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHAR_COMMAND_UUID,
        START_MEASUREMENT
    );
    await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHAR_COMMAND_UUID,
        DELETE_HISTORY  // quirk of the scale: needed for it to only send the newly recorded weight
    );
}

export function stopScanning() {
    bleManager.stopDeviceScan();
}