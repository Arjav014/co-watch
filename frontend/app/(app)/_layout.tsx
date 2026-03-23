import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoomSession } from '@/context/RoomSessionContext';

export default function AppLayout() {
  const { activeRoom } = useRoomSession();
  const isInRoom = !!activeRoom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          display: isInRoom ? 'none' : 'flex',
          height: isInRoom ? 0 : 60,
          paddingBottom: isInRoom ? 0 : 8,
          paddingTop: isInRoom ? 0 : 8,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#71717a',
        sceneStyle: { backgroundColor: '#18181b' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'DISCOVER',
          tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-room"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="join-room"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="watch-room"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
