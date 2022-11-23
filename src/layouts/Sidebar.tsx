import React, { ReactNode } from 'react';
import {
    Box,
    Flex,
    useColorModeValue,
    Text,
    BoxProps,
} from '@chakra-ui/react';

interface SidebarProps extends BoxProps {
    children: ReactNode
}

export const SidebarContent = ({ children, ...rest }: SidebarProps) => {
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: '320px' }}
            pos="fixed"
            h="full"
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Paint
                </Text>
            </Flex>
            {children}
        </Box>
    );
};


