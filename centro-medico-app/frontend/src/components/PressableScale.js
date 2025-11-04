import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const PressableScale = ({ children, onPress, style, scaleTo = 0.97, duration = 100, ...rest }) => {
  const anim = useRef(new Animated.Value(1)).current;

  const animateTo = (to) => {
    Animated.timing(anim, {
      toValue: to,
      duration,
      useNativeDriver: true
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animateTo(scaleTo)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale: anim }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default PressableScale;


