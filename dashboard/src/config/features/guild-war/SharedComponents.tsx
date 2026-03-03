import { Box, Flex, Icon, Text, FormLabel, Badge } from '@chakra-ui/react';

// ─── Reusable Section Card ────────────────────────────────────────────────────
export function SectionCard({
    icon,
    iconColor,
    title,
    description,
    children,
}: {
    icon: React.ElementType;
    iconColor: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            rounded="2xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _light={{ borderColor: 'blackAlpha.100', bg: 'white' }}
            bg="navy.800"
            overflow="hidden"
        >
            <Flex
                align="center"
                gap={3}
                px={5}
                py={4}
                borderBottom="1px solid"
                borderColor="whiteAlpha.100"
                _light={{ borderColor: 'blackAlpha.100', bg: 'gray.50' }}
                bg="whiteAlpha.50"
            >
                <Flex
                    w="36px"
                    h="36px"
                    rounded="lg"
                    bg={`${iconColor}20`}
                    align="center"
                    justify="center"
                    flexShrink={0}
                >
                    <Icon as={icon} w={4} h={4} color={iconColor} />
                </Flex>
                <Box>
                    <Text fontWeight="700" fontSize="sm" lineHeight="shorter">{title}</Text>
                    <Text fontSize="xs" color="TextSecondary">{description}</Text>
                </Box>
            </Flex>
            <Box px={5} py={5} color="TextPrimary">
                {children}
            </Box>
        </Box>
    );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <FormLabel mb={1} fontSize="sm" fontWeight="600" display="flex" alignItems="center" gap={2}>
            {children}
            {required && (
                <Badge colorScheme="red" fontSize="2xs" px={1.5} py={0.5} rounded="full">bắt buộc</Badge>
            )}
        </FormLabel>
    );
}
