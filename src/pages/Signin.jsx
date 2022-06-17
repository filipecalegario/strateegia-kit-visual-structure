import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { auth } from "strateegia-api";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { i18n } from "../translate/i18n";

export default function Signin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const accessToken = await auth(email, password);
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        navigate("/main");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'email ou senha inválidos',
        status: 'error',
        isClosable: true
      })
    }
  };

  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      localStorage.removeItem("accessToken");
    }
  }, []);

  return (
    <Flex minH={"100vh"} align={"top"} justify={"start"}>
      {/* <ColorModeSwitcher /> */}
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        {/* <Stack align={'center'}>
          <Heading fontSize={'2xl'}>strateegia caixa morfológica</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            entre com seu login de strateegia
          </Text>
        </Stack> */}
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          // boxShadow={'lg'}
          p={8}
        >
          <form onSubmit={handleSubmit} id="login-form">
            <Stack spacing={4}>
              <FormControl id="email">
                <FormLabel>{i18n.t('login.label1')}</FormLabel>
                <Input type="email" name="email" onChange={handleChange} />
              </FormControl>
              <FormControl id="password">
                <FormLabel>{i18n.t('login.label2')}</FormLabel>
                <Input
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  bg={"#3C69EB"}
                  color={"white"}
                  _hover={{
                    bg: "blue.400",
                  }}
                  type="submit"
                >
                  {i18n.t('login.button')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
