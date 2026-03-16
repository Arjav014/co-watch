import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
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
        name="chat"
        options={{
          title: 'CHAT',
          tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={22} color={color} />
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
    </Tabs>
  );
}
