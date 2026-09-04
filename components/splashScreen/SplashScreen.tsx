import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, View, Text, ImageBackground, Dimensions } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
    const loaderFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Анимация логотипа
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 40,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Появление основного текста
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // Появление подзаголовка
                Animated.timing(subtitleFadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start(() => {
                    // Появление индикатора
                    Animated.timing(loaderFadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                });
            });
        });

        const timer = setTimeout(async () => {
            try {
                const userJson = await AsyncStorage.getItem('@user');
                router.replace(userJson ? "/(tabs)" : "/auth");
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error);
                router.replace("/auth");
            }
        }, 3000);
        
        return () => clearTimeout(timer);
    }, []);

    // Анимированные точки
    const dot1Scale = useRef(new Animated.Value(0)).current;
    const dot2Scale = useRef(new Animated.Value(0)).current;
    const dot3Scale = useRef(new Animated.Value(0)).current;

    // Анимация точек
    useEffect(() => {
        const animateDot = (dot: Animated.Value, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.spring(dot, {
                        toValue: 1.5,
                        tension: 20,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                    Animated.spring(dot, {
                        toValue: 1,
                        tension: 20,
                        friction: 3,
                        useNativeDriver: true,
                    }),
                    Animated.delay(800),
                ])
            ).start();
        };
        
        animateDot(dot1Scale, 0);
        animateDot(dot2Scale, 200);
        animateDot(dot3Scale, 400);
    }, []);

    return (
        <>
            <StatusBar style="light" />
            <ImageBackground
                source={require('@/assets/images/foodBg.jpg')}
                style={{ flex: 1, width: width, height: height }}
                imageStyle={{ opacity: 0.7 }}
            >
                {/* Темный оверлей для контраста текста */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flex: 1 }}
                >
                    <View className="flex-1 justify-center items-center px-6">
                        {/* Декоративные элементы */}
                        <View className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                        <View className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-40 -mb-40" />
                        <View className="absolute top-1/3 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12" />

                        {/* Логотип */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            }}
                            className="items-center"
                        >
                            <View className="w-28 h-28 bg-white/70 rounded-2xl items-center justify-center shadow-2xl">
                                <Text className="text-7xl">🔥</Text>
                            </View>
                            <Text className="text-3xl font-bold text-white mt-6 tracking-wider">
                                MANGAL HOUSE
                            </Text>
                            <View className="w-16 h-0.5 bg-orange-400 mt-3 rounded-full" />
                        </Animated.View>

                        {/* Текст */}
                        <Animated.View 
                            style={{ opacity: textFadeAnim }}
                            className="items-center mt-8"
                        >
                            <Text className="text-white/90 text-lg font-medium">
                                Азербайджанская кухня
                            </Text>
                        </Animated.View>

                        {/* Подзаголовок */}
                        <Animated.View 
                            style={{ opacity: subtitleFadeAnim }}
                            className="items-center mt-2"
                        >
                            <Text className="text-orange-300 text-sm">
                                Доставка 30-45 минут
                            </Text>
                        </Animated.View>

                        {/* Анимированные точки */}
                        <Animated.View 
                            style={{ opacity: loaderFadeAnim }}
                            className="absolute bottom-20 flex-row items-center justify-center"
                        >
                            <Animated.View
                                style={{
                                    transform: [{ scale: dot1Scale }],
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#f97316',
                                    marginHorizontal: 6,
                                }}
                            />
                            <Animated.View
                                style={{
                                    transform: [{ scale: dot2Scale }],
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#f97316',
                                    marginHorizontal: 6,
                                }}
                            />
                            <Animated.View
                                style={{
                                    transform: [{ scale: dot3Scale }],
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#f97316',
                                    marginHorizontal: 6,
                                }}
                            />
                        </Animated.View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </>
    );
}