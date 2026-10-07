import * as ImagePicker from 'expo-image-picker';

export async function pickIncidentImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('L’autorisation d’accéder aux photos est nécessaire pour joindre une image.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
    mediaTypes: ['images'],
    quality: 0.7,
  });

  return result.canceled ? null : result.assets[0];
}

export async function takeIncidentPhoto() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('L’autorisation d’utiliser l’appareil photo est nécessaire pour prendre une photo.');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    mediaTypes: ['images'],
    quality: 0.7,
  });

  return result.canceled ? null : result.assets[0];
}
