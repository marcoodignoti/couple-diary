import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, IconName } from '../../components/ui/Icon';

function CustomTabBar({ state, descriptors, navigation }: any) {
  // Use a fixed safe area padding since useSafeAreaInsets was causing context issues
  const bottomPadding = process.env.EXPO_OS === 'ios' ? 34 : 20;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]} pointerEvents="box-none">
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: IconName = 'circle';
          let label = '';

          if (route.name === 'index') {
            iconName = 'edit';
            label = 'Diario';
          } else if (route.name === 'calendar') {
            iconName = 'calendar-today';
            label = 'Ricordi';
          } else if (route.name === 'insight') {
            iconName = 'bar-chart';
            label = 'Insight';
          } else if (route.name === 'profile') {
            iconName = 'person';
            label = 'Profilo';
          } else {
            return null;
          }

          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.activeTab}
                activeOpacity={0.8}
              >
                <Icon name={iconName} size={20} color="#1c1917" />
                <Text style={styles.activeLabel}>{label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.inactiveTab}
              activeOpacity={0.6}
            >
              <Icon name={iconName} size={24} color="#a8a29e" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    elevation: 0,
    zIndex: 9999, // High z-index but with box-none pointer events
  },
  tabBar: {
    backgroundColor: '#1c1917',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#292524',
    minWidth: 200,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeLabel: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1c1917',
  },
  inactiveTab: {
    padding: 12,
    borderRadius: 999,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="insight" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
