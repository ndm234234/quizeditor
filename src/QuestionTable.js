import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import CustomPagination from './CustomPagination';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { JSONToFile } from './tools.js';

function QuestionTable(props) {

  function updateData(data) {
    props.setData(data);
    props.updateTitle(data.title);
  }

  function handleChange(event) {
    if (event.target.files.length > 0) {

    let file = event.target.files[0];
    props.setFileName(file.name);
    var r = new FileReader();
    r.onload = function(e) { 
        let data = JSON.parse(e.target.result);
        updateData(data);
        event.target.value = null;
      }
    r.readAsText(file);
    }
  }

  if (!props.visible) 
  {
    return null;
  }
  else
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Control type="file" id="fileInput" 
          accept=".txt,.json"
          onChange={handleChange}  style={{ display: 'none' }}  />
          <ButtonGroup className="me-2">
            <Button variant="primary" onClick={() => { updateData({ title : "", items : new Array()}); }}>Новая/Сбросить</Button>
          </ButtonGroup>
          <ButtonGroup className="me-2">
            <Button variant="primary" onClick={() => document.getElementById('fileInput').click()}>Загрузить файл</Button>
          </ButtonGroup>
          <ButtonGroup className="me-2">
            <Button variant="primary" onClick={() => {
                var data = props.customData;
                data.title = props.title;
                JSONToFile(data, props.title.length > 0 ? props.title + ".txt" : props.fileName)
              }}>Сохранить файл</Button>
          </ButtonGroup>
      </Form.Group>
      <InputGroup className="mb-3">
        <InputGroup.Text>Название викторины</InputGroup.Text>
        <Form.Control
          placeholder='Название'
          value={props.title}
          onChange={(e) => props.updateTitle(e.target.value)} />
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
