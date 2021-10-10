import React, {useState, useEffect, useRef} from 'react';
import {  StyleSheet, Text, View, 
          SafeAreaView, Touchable, TouchableOpacity, 
          Modal, Image} from 'react-native';
import { Camera } from 'expo-camera';
import {FontAwesome, FontAwesome5} from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const camRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back)
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedPhoto, setCapturePhoto] = useState(null);
  const [burstPhoto, setBurstPhoto] = useState([])
  const [open, setOpen] = useState(false); 
  const [takeSucessivePicsVar, setTakeSucessivePicsVar] = useState(false); // sucessive captures

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

  async function takeSucessivePicturesTrigger(){
    if(takeSucessivePicturesTriggerVar){
      for (var i = 0; i < 9; i++) {
        console.log(i);
        // more statements
      }
      setTakeSucessivePicsVar(true);
    }
  }

  async function takeSucessivePictures(){
    /*let captures = []
    for (var i = 0; i < 3; i++) {
      //setTimeout( () => {burstModeCamera(), console.log(i), burstSavePhoto()}, 5000 )
      //console.log('aqui takeSucessivePictures')
      /*takePicture().finally(
        () => {
          savePicture();
        }
      );
      const data = burstModeCamera().finally(
      captures.push(JSON.parse(JSON.stringify(data)))
      )
      console.log('takeSucessivePictures iteration: ', i)
      //burstSavePhoto()
      
      //savePicture() 
      //takePicture()
      //savePicture()     
    }    
    console.log(sizeof(captures));*/
    
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function burstModeCamera(){
    //console.log('abriur burstModeCamera')
    if(camRef){
      //console.log('abriur camRef burstModeCamera')
      
        for (var i = 0; i < 3; i++){
          await sleep(2000);
          const data = await camRef.current.takePictureAsync()
          //console.log('burstModeCamera - data', data);
          const nData = JSON.parse(JSON.stringify(data));
          setCapturePhoto(nData)
          console.log('burstModeCamera - nData', nData);
          //const asset = await MediaLibrary.createAssetAsync(nData)
          const asset = await MediaLibrary.saveToLibraryAsync(nData.uri)
          .then( () => { alert('burstModeCamera - salvo!'); } )
          .catch(error => {
            console.log("\x1b[35m%s\x1b[0m", 
                        'burstModeCamera - erro de salvar\n' + 'Erro retornado: ' + error + '\nDado recebido: ' + typeof(nData.uri) 
                        );
          })
          //console.log('burstModeCamera asset: ', asset);
          console.log('burstModeCamera capturedPhoto: ', capturedPhoto);

      }
    }
    
  }

  async function burstSavePhoto(){

    try{
      //console.log('burstPhoto: ', burstPhoto)
      console.log('busrtSavePhoto - data: ', data)
      const data = burstPhoto.shift()
      const asset = await MediaLibrary.createAssetAsync(data)
      .then(
        () => {
          alert('Salvo com sucesso!');
        }
      )
      .catch(error => {
        console.log('burstSavePhoto - erro de salvar', error);
      })

    }catch(error){
        console.log('lista vazia no shift', error);
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
}

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
