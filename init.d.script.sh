#!/bin/bash

### BEGIN INIT INFO
# Provides:          gps-diff
# Required-Start:    $local_fs $network $syslog $time
# Required-Stop:     $local_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start daemon at boot time
# Description:       Enable service provided by daemon.
### END INIT INFO

## Fill in name of program here.
#!/bin/sh

# Quick start-stop-daemon example, derived from Debian /etc/init.d/ssh
set -e

# Must be a valid filename
NAME=gps-diff
PIDFILE=/var/run/$NAME.pid
#This is the command to be run, give the full pathname
DAEMON=/home/brian/apps/gps-diff/GpsDiffServer.exe
DAEMON_OPTS="-http http://localhost:54331/API/ -bk"

export PATH="${PATH:+$PATH:}/usr/sbin:/sbin"

case "$1" in
  start)
        echo -n "Starting daemon: "$NAME
	    start-stop-daemon --chuid brian --start --quiet --pidfile $PIDFILE --exec $DAEMON -- $DAEMON_OPTS &
        echo "."
	;;
  stop)
        echo -n "Stopping daemon: "$NAME
	start-stop-daemon --stop --quiet --oknodo --pidfile $PIDFILE
        echo "."
	;;
  restart)
        echo -n "Restarting daemon: "$NAME
	start-stop-daemon --stop --quiet --oknodo --retry 30 --pidfile $PIDFILE
	start-stop-daemon --start --quiet --pidfile $PIDFILE --exec $DAEMON -- $DAEMON_OPTS
	echo "."
	;;

  *)
	echo "Usage: "$1" {start|stop|restart}"
	exit 1
esac

exit 0