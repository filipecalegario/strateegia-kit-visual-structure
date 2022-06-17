import { Button } from "@chakra-ui/react";

export function ButtonExp({click, project, text}) {
    return (
        <Button
            size="xs"
            fontSize="14px"
            fontWeight="400"
            bg="#6c757d"
            color="#fff"
            borderRadius="3px"
            _hover={{
                bg: "#5C636A",
            }}
            paddingBottom={"4px"}
            disabled={project ? false : true}
            onClick={click}
            mr={0.5}
        >
            {text}
        </Button>
    )
}
  