import { Box, Heading, Link } from "@chakra-ui/react";
import { MdArrowUpward } from "react-icons/md";
import { useEffect, useState } from "react";
import * as api from "strateegia-api";
import Loading from "../components/Loading";
import MapList from "../components/MapList";
import ProjectList from "../components/ProjectList";
import DivPointByMapId from "../components/DivPointByMapId";
import { i18n } from "../translate/i18n";
import { fetchMapsById } from "../components/indicators";
import { ExportsButtons } from "../components/ExportsButtons";

export default function Main() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMap, setSelectedMap] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [mapDetails, setMapDetails] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [firstMap, setFirstMap] = useState(null);

  const handleSelectChange = (e) => {
    setSelectedProject(e.target.value);
    setIsLoading(true);
    async function fetchMapList() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const project = await api.getProjectById(accessToken, e.target.value);
        setFirstMap(project.maps[0].id);
      } catch (error) {
        console.log(error);
      }
    }
    setSelectedMap(null);
    fetchMapList();
  };

  const handleMapSelectChange = (value) => {
    setIsLoading(false);
    setSelectedMap(value);
  };

  useEffect(() => {
    setMapDetails(null);
    setSelectedMap(null);
  }, [selectedProject]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetchMapsById(accessToken, selectedMap, api.getMapById);
        setMapDetails({ ...response });
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [selectedMap]);
  
  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

  return (
    <Box padding={10} id='top'>
     <Box display="flex">
        <ProjectList disabled handleSelectChange={handleSelectChange} />
        <Link
          pointerEvents={selectedProject?.length > 0 ? '' : 'none'}
          href={selectedProject?.length > 0 ? `https://app.strateegia.digital/journey/${selectedProject}/map/${firstMap}` : '' }
          target="_blank"
          bg="#E9ECEF"
          borderRadius={" 0 6px 6px 0 "}
          fontSize={16}
          w={200}
          h="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {i18n.t('main.link')}
        </Link>
      </Box>
      <MapList
        projectId={selectedProject}
        handleSelectChange={handleMapSelectChange}
      />
      {selectedMap !== null && (
        <Box mt={'25px'}>
          <DivPointByMapId mapId={selectedMap} isLoading={isLoading}/>
        </Box>
      )}
      {scrollPosition > 500 && <Link href='#top'>
          <Box position='fixed'
              bottom='20px'
              right={['16px', '84px', '84px', '84px', '120px']}
              zIndex={2}
              cursor='pointer'
          >
            <MdArrowUpward size='30px'/>
          </Box>
      </Link>} 
    </Box>
  );
}
