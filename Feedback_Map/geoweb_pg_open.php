<?php
// Öffnen einer PostgreSQL-Datenbank mit pg_connect(Connectionstring)
// Im Connectionstring sind die Verbindungsdaten anzugeben:
// "host=... dbname=... user=... password=..."
$dbhost = 'localhost';
$dbname = 'geoweb2017';
$dbuser = 'geoweb2017';
$dbpass = 'geoweb4m10!';

// Verbindung zum PostgreSQL-Datenbank herstellen (bei Fehler Abbruch)
$db = pg_connect
("host=".$dbhost." dbname=".$dbname." user=".$dbuser." password=".$dbpass)
or die ('Fehler bei Verbindung zu GeoWeb-Datenbank: '.pg_last_error($db));
?>
