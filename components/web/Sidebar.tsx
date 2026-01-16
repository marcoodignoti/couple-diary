import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import { Link, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Sidebar() {
    const pathname = usePathname();
    const colorScheme = useColorScheme();
    const activeColor = Colors[colorScheme ?? 'light'].tint;
    const inactiveColor = '#8E8E93';

    const menuItems = [
        { name: 'Home', icon: 'home', path: '/(tabs)' },
        { name: 'Calendario', icon: 'calendar', path: '/(tabs)/calendar' },
        { name: 'Profilo', icon: 'user', path: '/(tabs)/profile' },
    ] as const;

    return (
        <View style={styles.container}>
            {/* Glass Background */}
            <BlurView
                intensity={80}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.header}>
                <Text style={styles.emoji}>💕</Text>
                <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Couple Diary
                </Text>
            </View>

            <View style={styles.menu}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || (item.path === '/(tabs)' && pathname === '/');
                    return (
                        <Link href={item.path} key={item.path} asChild>
                            <TouchableOpacity style={StyleSheet.flatten([
                                styles.menuItem,
                                isActive && styles.menuItemActive
                            ])}>
                                <FontAwesome
                                    name={item.icon}
                                    size={20}
                                    color={isActive ? activeColor : inactiveColor}
                                    style={{ width: 24, textAlign: 'center' }}
                                />
                                <Text style={[
                                    styles.menuText,
                                    { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? '600' : '400' }
                                ]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    )
                })}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Designed for Love</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: '100%',
        borderRightWidth: 1,
        borderRightColor: 'rgba(232, 180, 184, 0.2)',
        overflow: 'hidden',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emoji: {
        fontSize: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    menu: {
        padding: 12,
        gap: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    menuItemActive: {
        backgroundColor: 'rgba(232, 180, 184, 0.1)',
    },
    menuText: {
        fontSize: 16,
    },
    footer: {
        marginTop: 'auto',
        padding: 24,
    },
    footerText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
    }
});
