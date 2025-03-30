import  { useEffect, useState, useCallback } from "react";

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import CustomPagination from './CustomPagination';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import { JSONToFile } from './tools.js';
import MessageBoxModal from './MessageBoxModal.js';

function QuestionTable(props) {
  const [showConfirmModalQueryNew, setShowConfirmModalQueryNew] = useState(false);
  const [showConfirmModalQueryLoad, setShowConfirmModalQueryLoad] = useState(false);

  function updateData(data) {

    let oldFormat = false;
    var result =  data.items.map((item) => {
      let options = item.options.map((option) => {
        if (typeof option == "string") {
            oldFormat = true;
            return { name : option }
        }
        else {
          return option;
        }
      });

      return  {
              answers : item.answers,
              category : item.category,
              info : item.info,
              info_img : item.info_img,
              question : item.question,
              questionImage : item.questionImage,
              score : item.score,
              options : options
        }
    });

    var newData = 
    {
      title : data.title,
      items : result
    };

    props.setData(newData);
    props.updateTitle(newData.title);

    return oldFormat;
  }

  function handleChange(event) {
    if (event.target.files.length > 0) {

    let file = event.target.files[0];
    props.setFileName(file.name);
    var r = new FileReader();
    r.onload = function(e) { 
        let data = JSON.parse(e.target.result);
        createNewQuiz(data);
        event.target.value = null;
      }
    r.readAsText(file);
    }
  }

  function createNewQuiz(data = { title : "", items : new Array()}) {
    const needUpdate = updateData(data);
    props.setHasUnsavedChanges(needUpdate);
  }

  if (!props.visible) 
  {
    return null;
  }
  else
  return (
    <>
      <MessageBoxModal show={showConfirmModalQueryNew}  
                       title="Создание"
                       query="Создать новую викторину? Все несохраненные данные будут потеряны."
                       okButton="Создать"
                       onCancel={()=> { setShowConfirmModalQueryNew(false); }} 
                       OnOk={()=> {
                           setShowConfirmModalQueryNew(false);
                           createNewQuiz(); }} />

      <MessageBoxModal show={showConfirmModalQueryLoad}  
                       title="Есть несохраненные данные"
                       query="Загрузить новую викторину? Все несохраненные данные будут потеряны."
                       okButton="Загрузить"
                       onCancel={()=> { setShowConfirmModalQueryLoad(false); }} 
                       OnOk={()=> {
                          setShowConfirmModalQueryLoad(false);
                          document.getElementById('fileInput').click() }} />

      <Form.Group className="mb-3">
        <Form.Control type="file" id="fileInput" 
          accept=".txt,.json"
          onChange={handleChange}  style={{ display: 'none' }}  />
          <ButtonGroup className="me-2">
            <Button variant="primary" onClick={() => {
                if (!props.hasUnsavedChanges) {
                  createNewQuiz();
                } else {
                  setShowConfirmModalQueryNew(true);
                }
              }}>Новая/Сбросить</Button>
          </ButtonGroup>
          <ButtonGroup className="me-2">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic">Файл</Dropdown.Toggle>
              <Dropdown.Menu>
              <Dropdown.Item onClick={() => {
                 if (props.hasUnsavedChanges) {
                   setShowConfirmModalQueryLoad(true);
                 } else {
                   document.getElementById('fileInput').click()
                 }
               }}>Загрузить</Dropdown.Item>
              <Dropdown.Item disabled = {props.title.length == 0 || props.customData.items.length == 0} onClick={() => {
                let data = props.customData;
                data.title = props.title;
                JSONToFile(data, props.title.length > 0 ? props.title + ".txt" : props.fileName)
                props.setHasUnsavedChanges(false);
              }}>Сохранить</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ButtonGroup>
      </Form.Group>
      <InputGroup className="mb-3">
        <InputGroup.Text>Название викторины</InputGroup.Text>
        <Form.Control
          placeholder='Название'
          value={props.title}
          onChange={(e) => {
            props.updateTitle(e.target.value);
            props.setHasUnsavedChanges(true);
          }} />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text>Фильтр</InputGroup.Text>
        <Form.Control
          placeholder='Поиск'
          value={props.searchFilter}
          onChange={props.handleFilter} />
      </InputGroup>
      <Table striped bordered hover className="QuestionTable">
          <thead>
            <tr>
              <th>Вопросы</th>
              <th>Категория</th>
              <th>Очки</th>
              <th className='TdButtonColumn'>Действия</th>
            </tr>
          </thead>
          <tbody>
            {props.paginatedData.length > 0 ? (props.paginatedData.map((item, index) => {
              return (
                <tr key={item.question}>
                  <td>{item.question}</td>
                  <td>{item.category}</td>
                  <td className='TdScore'>{item.score}</td>
                  <td className='TdButtonAction'>
                  <ButtonGroup className="me-2"  >
                    <Button  onClick={() => props.showQuestion(item)}>Изменить</Button>
                  </ButtonGroup>
                  <ButtonGroup className="me-2" >
                    <Button  onClick={() => props.deleteQuestion(item)}>Удалить</Button>
                  </ButtonGroup>
                  </td>
                </tr>
              );
            })) : (
              <></>
            )}
          </tbody>
        </Table>
        {props.filteredData.length > 0 &&
          <CustomPagination
            itemsCount={props.filteredData.length}
            itemsPerPage={props.pageSize}
            currentPage={props.currentPage}
            setCurrentPage={props.setCurrentPage}
            alwaysShown={true} />}
        <div className="addButtons">
            <Button onClick={props.createNewQuestion}>Новый вопрос</Button>
        </div>
        </>
    );
  }

  export default QuestionTable;
