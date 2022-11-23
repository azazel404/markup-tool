
import { HTMLProps } from 'react'
import { Box, Heading } from '@chakra-ui/react'
interface ToolbarSectionProps extends HTMLProps<HTMLDivElement> {
    title: string
}

export default function ToolbarSection({
    title,
    children,
    ...props
}: ToolbarSectionProps) {
    return (
        <section {...props}>
            <Box w={'100%'}>
                <Heading fontSize={'16px'} mb={2}>{title}</Heading>
                {children}
            </Box>
        </section>
    )
}
