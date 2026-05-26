import { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { loadData, CatalogueObject } from './storage/catalogue';
import { useTheme } from './theme/useTheme';

const { width, height } = Dimensions.get('window');

export default function AlbumScreen() {
  const router = useRouter();
  const c = useTheme();
  const { domainId } = useLocalSearchParams<{ domainId: string }>();
  const [photos, setPhotos] = useState<CatalogueObject[]>([]);
  const [current, setCurrent] = useState(0);
  const [domain, setDomain] = useState<{ label: string; icon: string; color: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      loadData().then(data => {
        const found = data.find(d => d.id === domainId);
        if (!found) return;
        setDomain({ label: found.label, icon: found.icon, color: found.color });
        setPhotos(found.objects.filter(o => o.done && o.photoUri));
      });
    }, [domainId])
  );

  function onViewableItemsChanged({ viewableItems }: any) {
    if (viewableItems.length > 0) {
      setCurrent(viewableItems[0].index ?? 0);
    }
  }

  if (photos.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: c.textSecondary }]}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>📷</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>Aucune photo disponible</Text>
        </View>
      </View>
    );
  }

  const photo = photos[current];

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* Diaporama */}
      <FlatList
        ref={flatListRef}
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image
              source={{ uri: item.photoUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* Header flottant */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.domainIcon}>{domain?.icon}</Text>
          <Text style={styles.domainLabel}>{domain?.label}</Text>
        </View>
        <Text style={styles.counter}>{current + 1} / {photos.length}</Text>
      </View>

      {/* Info photo en bas */}
      <View style={styles.footer}>
        <Text style={styles.photoName} numberOfLines={1}>{photo?.name}</Text>
        <Text style={styles.photoType}>{photo?.type}</Text>
        {photo?.date && (
          <Text style={styles.photoDate}>📅 {photo.date}</Text>
        )}
        {photo?.notes ? (
          <Text style={styles.photoNotes} numberOfLines={2}>{photo.notes}</Text>
        ) : null}

        {/* Indicateurs de progression */}
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => flatListRef.current?.scrollToIndex({ index: i, animated: true })}
            >
              <View style={[
                styles.dot,
                { backgroundColor: i === current ? (domain?.color ?? '#fff') : '#ffffff44' }
              ]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Flèches navigation */}
      {current > 0 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowLeft]}
          onPress={() => flatListRef.current?.scrollToIndex({ index: current - 1, animated: true })}
        >
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
      )}
      {current < photos.length - 1 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowRight]}
          onPress={() => flatListRef.current?.scrollToIndex({ index: current + 1, animated: true })}
        >
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width,
    height,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00000088',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainIcon: {
    fontSize: 18,
  },
  domainLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  counter: {
    color: '#ffffff88',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#00000088',
    gap: 4,
  },
  photoName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  photoType: {
    color: '#ffffff88',
    fontSize: 13,
  },
  photoDate: {
    color: '#ffffff88',
    fontSize: 12,
    marginTop: 2,
  },
  photoNotes: {
    color: '#ffffffaa',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    width: 44,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000055',
  },
  arrowLeft: {
    left: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  arrowRight: {
    right: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  arrowText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
  },
  backBtn: {
    padding: 20,
    paddingTop: 60,
  },
  backText: {
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});