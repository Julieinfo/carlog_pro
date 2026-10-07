import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { vehicles, type VehicleStatus } from '@/data/vehicles';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatNumber } from '@/utils/format';

const filters: ('Tous' | VehicleStatus)[] = ['Tous', 'Disponible', 'En circulation', 'En entretien', 'Immobilisé'];

export default function VehiculesScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>('Tous');
  const filtered = useMemo(() => vehicles.filter((vehicle) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || `${vehicle.brand} ${vehicle.model} ${vehicle.plate}`.toLowerCase().includes(query);
    return matchesQuery && (selectedFilter === 'Tous' || vehicle.status === selectedFilter);
  }), [search, selectedFilter]);

  return <Screen>
    <Text style={[styles.title, { color: colors.text }]}>Véhicules</Text>
    <Text style={[styles.description, { color: colors.mutedText }]}>Consultez l’état de votre flotte.</Text>
    <TextInput accessibilityLabel="Rechercher un véhicule" value={search} onChangeText={setSearch} placeholder="Rechercher par modèle ou immatriculation" placeholderTextColor={colors.mutedText} style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, color: colors.text, marginTop: spacing.xl }]} />
    <FlatList data={filters} horizontal keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }} renderItem={({ item }) => {
      const selected = item === selectedFilter;
      return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedFilter(item)} style={[styles.filter, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border, borderRadius: radius.pill }]}><Text style={{ color: selected ? '#FFFFFF' : colors.text, fontSize: 13, fontWeight: '800' }}>{item}</Text></Pressable>;
    }} />
    {filtered.length === 0 ? <View style={styles.empty}><Text style={[styles.emptyTitle, { color: colors.text }]}>Aucun véhicule trouvé</Text><Text style={[styles.description, { color: colors.mutedText }]}>Modifiez votre recherche ou votre filtre.</Text></View> : filtered.map((vehicle) => <Pressable key={vehicle.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/vehicules/[id]', params: { id: vehicle.id } })} style={({ pressed }) => ({ marginBottom: spacing.md, opacity: pressed ? 0.8 : 1 })}><AppCard><View style={styles.row}><View style={styles.info}><Text style={[styles.name, { color: colors.text }]}>{vehicle.brand} {vehicle.model}</Text><Text style={[styles.detail, { color: colors.mutedText }]}>{vehicle.plate} · {formatNumber(vehicle.mileage)} km</Text><Text style={[styles.detail, { color: colors.mutedText }]}>{vehicle.assignedTo ? `Affecté à ${vehicle.assignedTo}` : 'Aucune affectation en cours'}</Text></View><StatusBadge status={vehicle.status} /></View></AppCard></Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  search: { borderWidth: 1, fontSize: 15, minHeight: 50, paddingHorizontal: 16 },
  filter: { borderWidth: 1, justifyContent: 'center', minHeight: 38, paddingHorizontal: 14 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800' },
  detail: { fontSize: 13, marginTop: 6 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
});
