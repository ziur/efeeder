#efeeder

## Motivation

Order healthy food as fast as possible!!!.

## HOW TO INSTALL THE APPLICATION

### Requirements:

#### Software needed

- Download and install Java 8 : 
http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
- Download and install MySQL Server 5.7 and the workbench: https://dev.mysql.com/downloads/workbench/
	* User and password for the admin are: root, root
	* Launch the workbench, connect to the database with login:root, pass:root
	* Create a schema called efeeder (CREATE SCHEMA efeeder)
- Download and install Tomcat 7: https://tomcat.apache.org/download-70.cgi
	* There is a zip version which should be unzipped in a folder, or
	* there is windows installer for those with this OS.
	* Configure it in port 9999
- Launch the Tomcat server recently installed.	
- Download and install maven 3.3.X: https://maven.apache.org/download.cgi

- For Development
One aditional requirement is to download and install Eclipse

#### Github

Create and account in git to have access https://github.com/ziur/efeeder

#### Verify the environment Variables are set

CATALINA_HOME
Path_to_apache-tomcat-7.0\bin

CATALINA_BASE
Path_to_apache-tomcat-7.0\bin

JRE_HOME
Path_to_jre\jre1.X.XXX .  Example: C:\Program Files\Java\jre1.8.0_101

JAVA_HOME
Path_to_java_folder\jdk1.X.XX    Example: C:\Program Files (x86)\Java\jdk1.8.0_111

PATH
Path_to_apache_maven_directory\bin; Example: ~\apache-maven-3.3.9\bin;


### Download and install efeeder

1. Create a directory where the application will be downloaded from git.  For example: ~/USER_HOME/git_projects/
2. Go to the directory just created and perform the following command: git clone https://github.com/ziur/efeeder
3. Go to folder efeeder, created in step 2.
4. Execute the command: mvn tomcat7:deploy (the tomcat server should be running before executing this step)


## License

GPLv3
