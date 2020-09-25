#!/bin/sh

cd ~/build-sharpai/android/project

PROJ_DIR=$HOME/mobile_app_server
cp $PROJ_DIR/ShareExtension/Android/MainActivity.java ./src/org/sharpai/everywhere/
cp $PROJ_DIR/sharpai-buildfiles/AndroidManifest.xml ./
# change the version number
VER=`grep version_of_build $PROJ_DIR/hotShareMobile/lib/6_version.js | cut -d"'" -f 2`
VER_P1=`echo $VER | cut -d'.' -f 1`
VER_P2=`echo $VER | cut -d'.' -f 2`
VER_P3=`echo $VER | cut -d'.' -f 3`
VERCODE=$(printf '20%02d%02d' $VER_P2 $VER_P3)
sed -i.bak "s/android:versionName=\"1.0.69\"/android:versionName=\"$VER\"/g" AndroidManifest.xml
sed -i.bak "s/android:versionCode=\"10069\"/android:versionCode=\"$VERCODE\"/g" AndroidManifest.xml

cp $PROJ_DIR/sharpai-buildfiles/gradle.properties ./gradle.properties
cp $PROJ_DIR/sharpai-buildfiles/strings.xml ./res/values/strings.xml
cp $PROJ_DIR/hotShareMobile/android.build.gradle ./build.gradle

#ANDROID_HOME=~/Library/Android/sdk gradle wrapper
#ANDROID_HOME=~/Library/Android/sdk/ ./gradlew assembleRelease -Pandroid.injected.signing.store.file=$PROJ_DIR/hotShareMobile/keystore -Pandroid.injected.signing.store.password=actiontec -Pandroid.injected.signing.key.alias="wifi whiteboard" -Pandroid.injected.signing.key.password=actiontec

gradle wrapper
./gradlew assembleRelease -Pandroid.injected.signing.store.file=$PROJ_DIR/hotShareMobile/keystore -Pandroid.injected.signing.store.password=actiontec -Pandroid.injected.signing.key.alias="wifi whiteboard" -Pandroid.injected.signing.key.password=actiontec


TIMESTAMP=`date "+%Y%m%d%H%M%S"`
# DESTFILE="$HOME/sharpai-$VER-$TIMESTAMP.apk"
#DESTFILE="$HOME/.jenkins/userContent/sharpai/sharpai-$VER-$TIMESTAMP.apk"
#cp ./build/outputs/apk/project-release.apk $DESTFILE

#cd -
