import { useState, useEffect } from "react";
import { Heading, Box, Text, List, ListItem, ListIcon, Link } from "@chakra-ui/react";
import { ChevronRightIcon } from '@chakra-ui/icons'
import { i18n } from "../translate/i18n";
import { ExportsButtons } from "../components/ExportsButtons";
import Loading from "../components/Loading";

import * as api from "strateegia-api";
import { fetchMapsById } from "./indicators";
import { getCsvData, generateDocument } from "./FileContent";


export default function DivPointByMapId({ mapId, isLoading }) {
    const accessToken = localStorage.getItem("accessToken");
    const [kits, setKits] = useState([]);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState([]);
    const [csv, setCsv] = useState([]);
    
    useEffect(() => {
        
        async function getAllDivPointsByMapId() {
            const result = await fetchMapsById(accessToken, mapId, api.getAllDivergencePointsByMapId);
            const content = result.length > 1 ? result.map(({content}) => content.flat()) : result.content;
            return content.flat();
        }

        getAllDivPointsByMapId().then(data => {
            setContent(data)
        });
    }, [mapId]);

    useEffect(() => {
        const kitsArr = [];
            content.map((cont) => {
                kitsArr.push({
                    mapId: cont.map_id,
                    divPointId: cont.id,
                    kitId: cont.tool.id,
                    kitTitle: cont.tool.title,
                    questions: cont.tool.questions,
                })
            })
            setKits(kitsArr);
    }, [content])

    useEffect(() => {
        kits.map(kit => 
            kit.questions.map(question =>  {
                setComments([])
                api.getParentComments(accessToken, kit.divPointId, question.id).then(({content})=> {
                    content.map(cont => {
                        setComments(c => [...c, {
                            kitTitle: kit.kitTitle,
                            question: question.question,
                            author: cont.author,
                            id: cont.id,
                            text: cont.text}])
                    });
                })
            }))
        
    }, [kits]);

    useEffect(() => {
        getCsvData(kits, comments).then(data => {
            setCsv(data)
        });
    }, [comments])
    
    return (
        <>
            <ExportsButtons data={csv} saveFile={() => generateDocument(mapId, kits, comments)} project={kits}/>
            <Loading active={isLoading} />
            <Heading as="h3" size="md" mb={3} mt={3} >
                {i18n.t('main.heading')}
            </Heading>
            {mapId.length > 0 && (
                <>
                    <Box>
                        <Heading as="h2" size="lg" m={'15px 2px'}>Índice</Heading>
                        <List spacing={3} maxW='80vw' display='flex' flexDir='column' flexWrap='wrap'  >
                        {kits.map(({kitTitle, kitId}) => (
                            <ListItem>
                                <Link href={`#${kitId}`}>
                                    <ListIcon as={ChevronRightIcon} color='blue'/>
                                    {kitTitle}
                                </Link>
                            </ListItem>
                        ))}
                        </List>
                    </Box>
                    <Box mt='50px' display='flex' flexDir='column'>

                        {
                        mapId.map(({label, value}) => (
                            <>
                                <Heading as="h1" fontSize={'24px'} fontWeight='400'>mapa: {label.toLowerCase()}</Heading>
                                {kits.filter(({mapId}) => mapId === value)
                                .map(({kitTitle, questions, kitId}) => (
                                    <>
                                        <Heading as="h2" fontSize={'24px'} mt={5} id={kitId}>kit: {kitTitle}</Heading>
                                        {questions.map(({question}) => (
                                            <>
                                            <Heading as='h3' fontSize={'24px'} fontWeight='600' m='30px 0' w='60%'>Questão: {question}</Heading>
                                            {comments.filter(kit => kit.kitTitle === kitTitle)
                                                .map(({author, text}) => (
                                                    <>
                                                        <Text mt='12px' w='60%'><strong>{author.name}</strong>: {text}</Text>
                                                    </>
                                                ))}
                                            </>
                                        ))}
                                    </>
                                ))}
                            </>
                        ))}
                    </Box>
                </>
            )}
        </>
    )

}
