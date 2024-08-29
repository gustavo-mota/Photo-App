import React, {useState, useEffect, useRef} from 'react';
import {    StyleSheet, Text, View, 
            SafeAreaView, Touchable, TouchableOpacity, 
            Modal, Image} from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import {FontAwesome, FontAwesome5} from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import * as FileSystem from "expo-file-system";
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';


const Cam = props => {
    const camRef = useRef(null);
    const [capturedPhoto, setCapturePhoto] = useState(null);
    const [open, setOpen] = useState(false); 
    const [type, setType] = useState(Camera.Constants.Type.back);

      // Permissões

  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  //request de geolocalização
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }
  // request files pessoais
  useEffect( () => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log(status);
      if (status !== 'granted'){
        setErrorMsg('Permissão de acesso aos arquivos necessária para salvar as imagens')
        return;
      }
    })();
  }, []);

  //request de camera 
  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    (async () => {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      console.log(status)
      setHasPermission(status === 'granted');
    })();
  }, []);

  if(hasPermission === null){
    return <View/>;
  }

  if(hasPermission === false){
    return <Text>Acesso negado!</Text>;
  }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function burstModeCamera(){
        //console.log('abriur burstModeCamera')
        if(camRef){
        //console.log('abriur camRef burstModeCamera')
            for (var i = 0; i < 27; i++){
            await sleep(2000);
            const data = await camRef.current.takePictureAsync({exif: true})
            //console.log('burstModeCamera - data', data);
            const geolocal = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.BestForNavigation})
            //console.log("\x1b[36m%s\x1b[0m", 'burstModeCamera - geolocal var: ')
            //console.log(geolocal);
            const nData = JSON.parse(JSON.stringify(data)); //usado como segurança
            //const tData = {...data, latitude: geolocal.coords.latitude, longitude: geolocal.coords.longitude}; //fadado a bugs
            //console.log('burstModeCamera nData: ', nData);
            //setCapturePhoto(nData);
            //console.log('burstModeCamera - nData', nData);
            // definindo nbome do arquivo com data, hora e coordenadas
            const fileName = nData.uri.slice();
            const fileData = nData.exif.DateTime.valueOf().toString().slice().replace(/:/g, '').replace(' ', '_');
            const latitude = geolocal.coords.latitude.toString().slice().replace('.', '_').replace('-','0');
            const longitude = geolocal.coords.longitude.toString().slice().replace('.', '_').replace('-','0');
            const startIndex = fileName.lastIndexOf('/');
            const endIndex = fileName.lastIndexOf('.');
            const newFileName = fileData + "_" + 
                                latitude + "_" + 
                                longitude
            //console.log('burstModeCamera newFileName: ', newFileName)
            //definindo uri para salvar
            const newUri = fileName.substring(0, startIndex+1) + newFileName + fileName.substring(endIndex);
            //console.log('burstModeCamera newUri: ', newUri)
            const rData = {...nData, "uri": newUri};
            //console.log('rData: ', rData);
            setCapturePhoto(rData);
            
            //const asset = await MediaLibrary.createAssetAsync(rData.uri)
            //const asset = await MediaLibrary.addAssetsToAlbumAsync(rData, rData.uri.toString(), false)
            //const asset = await MediaLibrary.saveToLibraryAsync(rData.uri)
            
            //await MediaLibrary.saveToLibraryAsync(rData.uri)
            //MediaLibrary.addAssetsToAlbumAsync([assets], album, copyAssets)
            await MediaLibrary.saveToLibraryAsync(nData.uri)
            .then( () => { alert('burstModeCamera - salvo! imagem: ' + i.toString()); } )
            .catch(error => {
                console.log("\x1b[35m%s\x1b[0m", 
                            'burstModeCamera - erro de salvar\n' + 'Erro retornado: ' + error + '\nDado recebido: ' + typeof(rData.uri) 
                            );
            })
            let asset = await MediaLibrary.createAssetAsync(nData.uri);
            const album = await MediaLibrary.getAlbumsAsync();
            console.log('#######################')
            console.log('albuns: ', album.filter( obj => {return obj.title === 'DCIM'} ))
            console.log('asset: ', asset)
            console.log("\x1b[34m%s\x1b[0m",
                        "#################\niteration: "+i.toString())
            //await MediaLibrary.addAssetsToAlbumAsync([asset], album, true)
            //console.log('burstModeCamera asset: ', asset);
            //console.log('burstModeCamera capturedPhoto: ', capturedPhoto);
        }
        }
    }

    async function savePicture(){
    const asset = await MediaLibrary.createAssetAsync(capturedPhoto)
    .then(
        () => {
        alert('Salvo com sucesso!');
        }
    )
    .catch(error => {
        console.log('savePicture erro', error);
    })
    }

    async function takePicture(){
    if(camRef){
        const data = await camRef.current.takePictureAsync();
        console.log('takePicture working, data.uri: ', data.uri)
        setCapturePhoto(data.uri);
        setOpen(true);
        //console.log(data);
    }
    }

    return (
    <SafeAreaView style={styles.container}>
        <Camera
            style={{ flex: 1}}
            type={type}
            ref={camRef}
        >
            <View style={styles.camFlip}>
        <TouchableOpacity //botão de flip
            style={styles.camFlipButton} 
            onPress={
            () => {
                setType(
                type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
                );
            }
            }
            >
            <Text style={styles.camFlipButtonText}>Flip</Text>
        </TouchableOpacity>
        </View>
        </Camera>

        <View style={{margin:10, flexDirection: 'row'}}>
            <TouchableOpacity 
            style={styles.pictureButton}
            onPress={burstModeCamera}
            >
            <FontAwesome5 name='images' size={24} color='#FFF'/>
            </TouchableOpacity>

            <TouchableOpacity 
            style={styles.pictureButton}
            onPress={takePicture}>
                <FontAwesome name='camera' size={25} color='#FFF'/>
            </TouchableOpacity>

            {
            //capturedPhoto &&
            false &&
            <Modal 
                animationType = "slide"
                transparent={false}
                visible={open}>
                <View style={styles.showImageModal}>
                    <View style={{margin: 10, flexDirection: 'row'}}>
                    <TouchableOpacity style={{margin: 10}}>
                        <FontAwesome 
                        name='window-close' 
                        size={50} 
                        color='#F00' 
                        onPress={() => setOpen(false)}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={{margin: 10}}>
                        <FontAwesome 
                        name='upload' 
                        size={50} 
                        color='#121212' 
                        onPress={savePicture}/>
                    </TouchableOpacity>
                    </View>

                    <Image 
                    style={{width: '100%', height: 350, borderRadius: 20}}
                    source={{uri: capturedPhoto}}/>
                </View>
            </Modal>
            }
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camFlip: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
    },
    camFlipButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    camFlipButtonText: {
        fontSize: 20,
        marginBottom: 13,
        color: '#FFF',
    },
    pictureButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        margin: 20,
        borderRadius: 10, 
        height: 50,
    },
    showImageModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    }
});

export default Cam;