from django.core.management import call_command
import threading
import time
import os
import sys
import atexit

if sys.platform == "win32":
    import msvcrt
else:
    import fcntl

# Global flag to track if scheduler is running
_scheduler_running = False
_lock_file = None

def cleanup():
    """Cleanup function to release the lock file when the process exits"""
    global _lock_file
    if _lock_file:
        try:
            if sys.platform == "win32":
                pass  # unlocking is not needed with msvcrt, just close the file
            else:
                fcntl.flock(_lock_file, fcntl.LOCK_UN)
        finally:
            _lock_file.close()
            _lock_file = None

def acquire_lock():
    """Try to acquire a lock file to ensure only one scheduler runs"""
    global _lock_file
    lock_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'scheduler.lock')
    _lock_file = open(lock_file_path, 'w')
    try:
        if sys.platform == "win32":
            msvcrt.locking(_lock_file.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            fcntl.flock(_lock_file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        atexit.register(cleanup)
        return True
    except (IOError, OSError):
        _lock_file.close()
        _lock_file = None
        return False

def run_reminder_checker():
    """
    Run the reminder checker every minute
    """
    global _scheduler_running
    _scheduler_running = True
    
    while _scheduler_running:
        try:
            call_command('check_reminders')
        except Exception as e:
            print(f"Error in reminder scheduler: {str(e)}")
        time.sleep(60)  # Check every minute

def start_reminder_scheduler():
    """
    Start the reminder scheduler in a separate thread
    """
    global _scheduler_running
    if not _scheduler_running and acquire_lock():
        thread = threading.Thread(target=run_reminder_checker, daemon=True)
        thread.start() 