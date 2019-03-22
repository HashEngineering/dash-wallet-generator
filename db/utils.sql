# for creating new databases

CREATE TABLE wallets(id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, address VARCHAR(35) NOT NULL, wif VARCHAR(64) NOT NULL, txid VARCHAR(64), amount BIGINT, utxo VARCHAR(1024));
CREATE TABLE swept(id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, funded_address VARCHAR(35) NOT NULL, swept_address VARCHAR(35) NOT NULL, txid VARCHAR(64), amount BIGINT);
CREATE TABLE spent(id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, funded_address VARCHAR(35) NOT NULL, spent_address VARCHAR(35) NOT NULL, txid VARCHAR(64), amount BIGINT);



# for importing CSV into database

 LOAD DATA LOCAL INFILE '/home/jon/development/dash-wallet-generator-mysql/files/DCG/August-21-2018/wallets.csv'
 INTO TABLE wallets
 FIELDS TERMINATED BY ','
 LINES TERMINATED BY '\r'
 IGNORE 1 LINES
 (address, wif, @dummy2, @dummy3)



# for exporting wallet list

SELECT * INTO OUTFILE '/var/lib/mysql-files/km_feb_22_k7_9950.csv'
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
FROM wallets;



# for exporting wallet stats

SELECT * INTO OUTFILE '/var/lib/mysql-files/dcg_nov_27_2018_k4_swept.csv'
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
FROM swept;

SELECT * INTO OUTFILE '/var/lib/mysql-files/dcg_nov_27_2018_k4_spent.csv'
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
FROM spent;



# for renaming databases

mysqldump -u username -p -v olddatabase > olddbdump.sql
mysqladmin -u username -p create newdatabase
mysql -u username -p newdatabase < olddbdump.sql


mysqldump -u root -p -v km_nov_15_k6_3290 > km_nov_15_k6_3290.sql
mysqladmin -u root -p create km_nov_15_k6_6530
mysql -u root -p km_nov_15_k6_6530 < km_nov_15_k6_3290.sql