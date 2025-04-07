import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react-native';

interface ActivityLog {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  created_at: string;
  notes?: string;
}

export default function TrainingScreen() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      const { data, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activitiesError) {
        throw activitiesError;
      }

      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Log</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/training/add')}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesContainer}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityType}>{activity.activity_type}</Text>
              <Text style={styles.activityDate}>
                {new Date(activity.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.activityStats}>
              <Text style={styles.activityStat}>
                {activity.duration_minutes} mins
              </Text>
              <Text style={styles.activityStat}>
                {activity.calories_burned} cal
              </Text>
            </View>
            {activity.notes && (
              <Text style={styles.activityNotes}>{activity.notes}</Text>
            )}
          </View>
        ))}
        {!loading && activities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No activities recorded yet.</Text>
            <Text style={styles.emptyStateSubtext}>Start tracking your workouts by tapping the + button.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitiesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  activityCard: {
    backgroundColor: '#2d2e32',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  activityDate: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  activityStat: {
    fontSize: 16,
    color: '#6366f1',
    fontFamily: 'Inter-SemiBold',
  },
  activityNotes: {
    marginTop: 8,
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    backgroundColor: '#2d2e32',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#a1a1aa',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  }
});