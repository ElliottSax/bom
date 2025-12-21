import React from 'react';
import { Text } from 'react-native';

const Icon = ({ name, size, color, ...props }) => (
  <Text {...props}>{name}</Text>
);

Icon.getImageSource = jest.fn(() => Promise.resolve({}));
Icon.getImageSourceSync = jest.fn(() => ({}));
Icon.loadFont = jest.fn(() => Promise.resolve());
Icon.hasIcon = jest.fn(() => Promise.resolve(true));

export default Icon;