import { useState, useEffect } from 'react';
import Select from 'react-select';

import { i18n } from "../translate/i18n";
import * as api from 'strateegia-api';

export default function MapList({ projectId, handleSelectChange }) {
  const [mapList, setMapList] = useState(null);
  const [allSelected, setAllSelected] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchMapList() {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const project = await api.getProjectById(accessToken, projectId);
        
        const maps = project.maps;
        const allOption = {id: 0, title: i18n.t('selector.list')};
        maps?.length > 1 && maps.unshift(allOption);
        
        const mapData = [];
        maps?.map(mapItem => {
          const data = {
            label: mapItem.title,
            value: mapItem.id
          };
          mapData.push(data);
        })
        setMapList(mapData);
      } catch (error) {
        console.log(error);
      }
    }
    setAllSelected(false);
    setSelected(null);
    fetchMapList();
  }, [projectId]);

  const changeSelectAll = () => {
    handleSelectChange(mapList.slice(1));
    setAllSelected(true);
  };

  return projectId && (
    <Select
      placeholder={i18n.t('main.placeholderMap')} 
      options={mapList}
      isMulti
      value={allSelected ? mapList?.slice(1) : selected}
      onChange={ selected => {
        setAllSelected(false)
        setSelected(selected)
        selected.find(option => option.label === i18n.t('selector.list')) ? 
          changeSelectAll()
        : handleSelectChange(selected);
      }} 
      isSearchable 
    />
  )
}
