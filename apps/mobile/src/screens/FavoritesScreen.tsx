import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BottomNav } from '../components/BottomNav';
import {
  FavoriteRoute,
  formatFavoriteMeta,
  getFavoriteRoutes,
  removeFavoriteRoute,
  updateFavoriteName,
} from '../services/favoritesStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation, route }: Props) {
  const from = route.params?.from;
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [renameTarget, setRenameTarget] = useState<FavoriteRoute | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      setFavorites(await getFavoriteRoutes());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const openRename = (item: FavoriteRoute) => {
    setRenameTarget(item);
    setRenameDraft(item.displayName);
  };

  const confirmRename = async () => {
    if (!renameTarget) return;
    const name = renameDraft.trim();
    if (!name) return;
    await updateFavoriteName(renameTarget.route._id, name);
    setRenameTarget(null);
    await loadFavorites();
  };

  const handleRemove = (item: FavoriteRoute) => {
    Alert.alert(
      'Ta bort favorit',
      `Vill du ta bort "${item.displayName}" från favoriter?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            await removeFavoriteRoute(item.route._id);
            await loadFavorites();
          },
        },
      ]
    );
  };

  const showItemMenu = (item: FavoriteRoute) => {
    Alert.alert(item.displayName, undefined, [
      { text: 'Byt namn', onPress: () => openRename(item) },
      {
        text: 'Ta bort från favoriter',
        style: 'destructive',
        onPress: () => handleRemove(item),
      },
      { text: 'Avbryt', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.title}>Favoriter</Text>
        <View style={styles.headerSide} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#2f7a3f" />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Inga favoriter än</Text>
          <Text style={styles.emptyText}>
            Avsluta en rutt och tryck på Spara som favorit.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.route._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.thumb}>
                <Ionicons name="trail-sign-outline" size={26} color="#6b8f74" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.displayName}
                </Text>
                <Text style={styles.rowMeta}>
                  {formatFavoriteMeta(item.favoritedAt, item.route.distance)}
                </Text>
              </View>
              <Pressable
                style={styles.iconButton}
                onPress={() => handleRemove(item)}
                accessibilityLabel="Ta bort favorit"
              >
                <Ionicons name="heart" size={22} color="#e74c3c" />
              </Pressable>
              <Pressable
                style={styles.iconButton}
                onPress={() => showItemMenu(item)}
                accessibilityLabel="Fler alternativ"
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal
        visible={renameTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setRenameTarget(null)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Byt namn på rutt</Text>
            <TextInput
              style={styles.modalInput}
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="T.ex. Hellasgården"
              autoFocus
              maxLength={60}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setRenameTarget(null)}
              >
                <Text style={styles.modalCancelText}>Avbryt</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={confirmRename}>
                <Text style={styles.modalSaveText}>Spara</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNav
        navigation={navigation}
        activeTab="Favorites"
        fromOrigin={from}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerSide: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 72,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 88,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f2',
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#eef4f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  rowMeta: {
    fontSize: 14,
    color: '#8a949c',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalSave: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2f7a3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
