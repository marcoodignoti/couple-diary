import React, { useEffect } from 'react';
import { Dimensions, Image, ImageSourcePropType, ImageStyle, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { Colors, FontSizes, Spacing } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlideProps {
    title: string;
    description: string;
    image: ImageSourcePropType;
    isActive: boolean;
    direction: 'left' | 'right' | 'none';
    index: number;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
    title,
    description,
    image,
    isActive,
    direction,
}) => {
    // Shared values for animations
    const opacity = useSharedValue(isActive ? 1 : 0);
    const translateX = useSharedValue(isActive ? 0 : direction === 'left' ? -width : direction === 'right' ? width : 0);
    const scale = useSharedValue(isActive ? 1 : 0.95);
    const contentTranslateY = useSharedValue(isActive ? 0 : 20);
    const contentOpacity = useSharedValue(isActive ? 1 : 0);

    useEffect(() => {
        if (isActive) {
            opacity.value = withTiming(1, { duration: 500 });
            translateX.value = withSpring(0, { damping: 200, stiffness: 200 });
            scale.value = withDelay(200, withSpring(1, { damping: 200, stiffness: 200 }));
            contentTranslateY.value = withDelay(300, withSpring(0, { damping: 200, stiffness: 200 }));
            contentOpacity.value = withDelay(300, withTiming(1));
        } else {
            const exitX = direction === 'left' ? -width : width;
            opacity.value = withTiming(0, { duration: 500 });
            if (direction !== 'none') {
                translateX.value = withTiming(exitX, { duration: 500, easing: Easing.out(Easing.exp) });
            }
            scale.value = withTiming(0.95, { duration: 500 });
            contentTranslateY.value = withTiming(20, { duration: 300 });
            contentOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [isActive, direction]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    const imageStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    // Don't render completely completely out of sight/logic to save resources if needed, 
    // but here we keep it simple for generic transitions

    return (
        <Animated.View style={[styles.container, containerStyle]} pointerEvents={isActive ? 'auto' : 'none'}>
            <View style={styles.contentContainer}>
                {/* Illustration */}
                <Animated.View style={[styles.imageContainer, imageStyle]}>
                    <Image
                        source={image}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Text Content */}
                <Animated.View style={[styles.textContainer, contentStyle]}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing[6],
    } as ViewStyle,
    contentContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        // Push content up a bit to leave room for bottom nav
        paddingBottom: 100,
    } as ViewStyle,
    imageContainer: {
        width: '100%',
        height: height * 0.45,
        marginBottom: Spacing[8],
        alignItems: 'center',
        justifyContent: 'center',
        // Shadow equivalent
        shadowColor: Colors.primary.DEFAULT,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    } as ViewStyle,
    image: {
        width: '100%',
        height: '100%',
    } as ImageStyle,
    textContainer: {
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    } as ViewStyle,
    title: {
        fontSize: FontSizes['3xl'],
        fontWeight: 'bold',
        color: Colors.text.light, // Default text color
        marginBottom: Spacing[4],
        textAlign: 'center',
        fontFamily: 'SpaceMono', // or specific font
    } as TextStyle,
    description: {
        fontSize: FontSizes.lg,
        color: '#64748b', // muted text
        textAlign: 'center',
        lineHeight: 24,
    } as TextStyle,
});
