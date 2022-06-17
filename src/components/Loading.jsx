import { Flex, Stack, Spinner } from "@chakra-ui/react";

export default function Loading({ active }) {
  return active ? (
    <Flex minH={"100vh"} align={"top"} justify={"center"} mt={6}>
      <Stack>
        <Spinner size="xl" />
      </Stack>
    </Flex>
  ) : null;
}
