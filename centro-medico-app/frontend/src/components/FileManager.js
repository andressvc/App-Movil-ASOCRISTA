// components/FileManager.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';

const FileManager = ({ 
  visible, 
  onClose, 
  patientId, 
  onFileUploaded,
  existingFiles = [] 
}) => {
  const { theme } = useTheme();
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se requiere permiso para acceder a la galería');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadFile(result.assets[0], 'image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se requiere permiso para acceder a la cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadFile(result.assets[0], 'image');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        await uploadFile(result.assets[0], 'document');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  };

  const uploadFile = async (file, type) => {
    try {
      setUploading(true);
      
      // Simular subida de archivo
      const fileData = {
        id: Date.now().toString(),
        name: file.fileName || file.uri.split('/').pop(),
        type: type,
        uri: file.uri,
        size: file.fileSize || 0,
        uploadedAt: new Date().toISOString(),
        patientId: patientId,
      };

      setFiles(prev => [...prev, fileData]);
      
      if (onFileUploaded) {
        onFileUploaded(fileData);
      }

      Alert.alert('Éxito', 'Archivo subido correctamente');
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'No se pudo subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = (fileId) => {
    Alert.alert(
      'Eliminar Archivo',
      '¿Estás seguro de que quieres eliminar este archivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setFiles(prev => prev.filter(file => file.id !== fileId));
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return 'image-outline';
      case 'document':
        return 'document-outline';
      case 'pdf':
        return 'document-text-outline';
      default:
        return 'attach-outline';
    }
  };

  const renderFile = ({ item }) => (
    <View style={[styles.fileItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.fileInfo}>
        <Ionicons 
          name={getFileIcon(item.type)} 
          size={24} 
          color={theme.primary} 
        />
        <View style={styles.fileDetails}>
          <Text style={[styles.fileName, { color: theme.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.fileSize, { color: theme.text.secondary }]}>
            {formatFileSize(item.size)} • {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFile(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={theme.gray[400]} />
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
        No hay archivos
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.text.secondary }]}>
        Sube documentos, imágenes o archivos médicos
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Gestión de Archivos
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Upload Actions */}
          <View style={styles.uploadActions}>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: theme.primary }]}
              onPress={pickImage}
              disabled={uploading}
            >
              <Ionicons name="image-outline" size={20} color={theme.white} />
              <Text style={[styles.uploadButtonText, { color: theme.white }]}>
                Galería
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: theme.secondary }]}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Ionicons name="camera-outline" size={20} color={theme.white} />
              <Text style={[styles.uploadButtonText, { color: theme.white }]}>
                Cámara
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: theme.info }]}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Ionicons name="document-outline" size={20} color={theme.white} />
              <Text style={[styles.uploadButtonText, { color: theme.white }]}>
                Documento
              </Text>
            </TouchableOpacity>
          </View>

          {/* Files List */}
          <View style={styles.filesContainer}>
            {uploading && (
              <View style={styles.uploadingIndicator}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.uploadingText, { color: theme.text.secondary }]}>
                  Subiendo archivo...
                </Text>
              </View>
            )}
            
            <FlatList
              data={files}
              keyExtractor={(item) => item.id}
              renderItem={renderFile}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.gray[100] }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.text.primary }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FileManager;
