import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export const carregarLogoBase64 = async () => {
  const asset = Asset.fromModule(require('../assets/imagensEco/eco-novo.jpeg'));
  await asset.downloadAsync();

  const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:image/png;base64,${base64}`;
};
