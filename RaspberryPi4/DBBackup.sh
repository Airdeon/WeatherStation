#!/bin/bash
# Emplacement du dossier ou nous allons stocker les bases de données, un dossier par base de données
CHEMIN=/home/pi/dbbackup/
DATE=`date +%y_%m_%d_%k_%M`
# On compte le nombre d'archive presente dans le dossier
NbArchive=$(ls -A $CHEMIN/ |wc -l)
# Si il y a plus de 30 archives, on supprime la plus ancienne
if [ "$NbArchive" -gt 30 ];then
# On recupere l'archive la plus ancienne
  Old_backup=$(ls -lrt $CHEMIN/ |grep ".gz" | head -n 1 | cut -d ":" -f 2 | cut -d " " -f 2);
# On supprime l'archive la plus ancienne
  rm $CHEMIN/$Old_backup
fi
# On backup notre base de donnees
  mysqldump -u weather --single-transaction --password=weatheraspremont --databases WeatherDataBase | gzip > "$CHEMIN/$DATE"_WeatherDataBaseBackup.sql.gz
  echo "|Sauvegarde de la base de donnees "$CHEMIN/$DATE"_WeatherDataBaseBackup.sql.gz";
