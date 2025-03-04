import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';

interface TaskCardProps {
  time: string;
  title: string;
  client: string;
  address: string;
  status: 'completed' | 'current' | 'upcoming';
  onPress?: () => void;
  onCheckIn?: () => void;
}

export default function TaskCard({
  time,
  title,
  client,
  address,
  status,
  onPress,
  onCheckIn
}: TaskCardProps) {
  
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'current': return '#3B82F6';
      case 'upcoming': return '#64748B';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'current': return 'En cours';
      case 'upcoming': return 'À venir';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      <View style={styles.timeContainer}>
        <Clock size={16} color="#64748B" />
        <Text style={styles.timeText}>{time}</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.clientContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=50&auto=format&fit=crop' }} 
          style={styles.clientImage} 
        />
        <Text style={styles.clientName}>{client}</Text>
      </View>
      
      <View style={styles.addressContainer}>
        <MapPin size={16} color="#64748B" />
        <Text style={styles.addressText}>{address}</Text>
      </View>
      
      <View style={styles.actions}>
        {status !== 'completed' && onCheckIn && (
          <TouchableOpacity 
            style={styles.checkInButton}
            onPress={onCheckIn}
          >
            <Text style={styles.checkInText}>Pointer</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>Détails</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    color: '#64748B',
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  clientName: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  addressText: {
    color: '#64748B',
    marginLeft: 6,
    fontSize: 14,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  checkInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  checkInText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  detailsButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  detailsText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});