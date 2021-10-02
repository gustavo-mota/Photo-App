import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, SafeAreaView, Touchable, TouchableOpacity, Modal, Image} from 'react-native';
import { Camera } from 'expo-camera';
import {FontAwesome} from '@expo/vector-icons';
import * as MeidaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const camRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back)
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedPhoto, setCapturePhoto] = useState(null);
  const [open, setOpen] = useState(false);

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

  async function takePicture(){
    if(camRef){
      const data = await camRef.current.takePictureAsync();
      setCapturePhoto(data.uri);
      setOpen(true);
      console.log(data);
    }
  }

  async function savePicture(){
    const asset = await MeidaLibrary.createAssetAsync(capturedPhoto)
    .then(
      () => {
        alert('Salvo com sucesso!');
      }
    )
    .catch(error => {
      console.log('err', error);
    })
  }


  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={{ flex: 1}}
        type={type}
        ref={camRef}
      >
        <View style={styles.camFlip}>
      <TouchableOpacity 
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
      <TouchableOpacity 
        style={styles.pictureButton}
        onPress={takePicture}>
          <FontAwesome name='camera' size={25} color='#FFF'/>
        </TouchableOpacity>

        {
          capturedPhoto &&
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
