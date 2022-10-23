import React, { Component, createContext } from "react";
import { View, Text, Alert } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { DataProvider } from "recyclerlistview";

export const AudioContext = createContext();
class AudioProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioFiles: [],
      permissionError: false,
      dataProvider: new DataProvider((r1, r2) => r1 !== r2),
    };
  }

  permissionAlert = () => {
    Alert.alert("permission  required", "this app need to read audio files", [
      {
        text: "im ready",
        onPress: () => this.getPermission(),
      },
      {
        text: "canceled",
        onPress: () => this.permissionAlert(),
      },
    ]);
  };

  getAudioFiles = async () => {
    const { dataProvider, audioFiles } = this.state;
    let media = await MediaLibrary.getAssetsAsync({ mediaType: "audio" });
    media = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: media.totalCount,
    });
    // console.log(media.assets.length);
    this.setState({
      ...this.state,
      dataProvider: dataProvider.cloneWithRows([
        ...audioFiles,
        ...media.assets,
      ]),
      audioFiles: [...audioFiles, ...media.assets],
    });
  };

  getPermission = async () => {
    //{status: 'undetermined', canAskAgain: true, granted: false, expires: 'never'}
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.granted) {
      //get all audio files
      this.getAudioFiles();
    }
    if (!permission.canAskAgain && !permission.granted) {
      this.setState({ ...this.state, permissionError: true });
    }

    if (!permission.granted && permission.canAskAgain) {
      const { status, canAskAgain } =
        await MediaLibrary.requestPermissionsAsync();
      if (status === "denied" && canAskAgain) {
        //alert user must allow permission to work this app
        this.permissionAlert();
      }
      if (status === "granted") {
        //get all audio files
        this.getAudioFiles();
      }
      if (status === "denied" && !canAskAgain) {
        //display error
        this.setState({ ...this.state, permissionError: true });
      }
    }
  };

  componentDidMount() {
    this.getPermission();
  }

  render() {
    const { audioFiles, permissionError, dataProvider } = this.state;
    if (permissionError)
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 25, textAlign: "center", color: "red" }}>
            It's looks like you denied permission access
          </Text>
        </View>
      );
    return (
      <AudioContext.Provider value={{ audioFiles, dataProvider }}>
        {this.props.children}
      </AudioContext.Provider>
    );
  }
}

export default AudioProvider;
