import  { useEffect, useState, useCallback } from "react";
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import CloseButton from 'react-bootstrap/CloseButton';
import Button from "react-bootstrap/Button";
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { uuid } from './tools.js';

function QuestionPanel(props) {
  const [validated, setValidated] = useState(true);

  const checkItem = (item) => {
    return item.question.length > 0 &&
           item.options.filter(i => i.length == 0).length == 0 &&
           item.score > 0;
  }

    if (!props.visible) 
    {
      return <div></div>
    }
    else 
    return (
      <><InputGroup className="mb-3">
          <InputGroup.Text>Категория вопроса</InputGroup.Text>
          <Form.Control 
            value={props.category}
            isInvalid={validated && props.category.length == 0}
            onChange={e => props.setCategory(e.target.value)} />
        <Form.Control.Feedback type="invalid">Необходимо ввести название категории</Form.Control.Feedback>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Очки</InputGroup.Text>
          <Form.Control type="number"
            value={props.score}
            isInvalid={validated && props.score.length == 0 || parseInt(props.score) == 0}
            onChange={e => props.setScore(e.target.value)} />
          <Form.Control.Feedback type="invalid">Необходимо ввести количество очков</Form.Control.Feedback>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Вопрос</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Введите вопрос"
            required 
            autoFocus 
            isInvalid={validated && props.question.length == 0}
            value={props.question}
            onChange={e => props.setQuestion(e.target.value)} />
            <Form.Control.Feedback type="invalid">Необходимо ввести вопрос</Form.Control.Feedback>
        </InputGroup>
        <div>
          <Form.Label>Варианты ответов (<b>правильные выделите галочкой слева от ответа</b>)</Form.Label>
          <AnswersDisplay answers={props.answers} 
                          updateAnswerText={props.updateAnswerText} 
                          updateAnswerCorrect={props.updateAnswerCorrect} deleteAnswer={props.deleteAnswer}
                          validated={validated} />
          <div className="buttonPanel">
              <Button onClick={() => {
                props.setAnswers(answers => [...answers, { name: "", correct: 0, id: uuid() }]);
              } }>Добавить ответ</Button>
          </div>
        </div>
        <div>
          <Form.Label>Информация о правильном ответе</Form.Label>
          <Form.Control placeholder="Дополнительная информация о правильном ответе" as="textarea" rows={5}
            value={props.info != null ? props.info : ""}
            onChange={e => props.setInfo(e.target.value)}/>
          <Form.Label>Изображение</Form.Label>
          <Form.Control placeholder="Название файла картинки или ссылка"
            value={props.infoImg != null ? props.infoImg : ""}
            onChange={e => props.setInfoImg(e.target.value)} />
        </div>
        <div className="buttonPanel">
            <ButtonGroup className="me-2">
                <Button onClick={() => { 
                    var item = 
                    {
                        question : props.question,
                        options : props.answers.map((item) => { return item.name;  }),
                        answers : props.answers.map((item, index) =>  { return { item : item, index : index}; }).filter((item) => item.item.correct).map((item) => {
                                return item.index;
                            }),
                        score : parseInt(props.score.length == 0 ? "0" : props.score) ,
                        category : props.category,
                        info : props.info,
                        info_img : props.infoImg
                    }
                    if (checkItem(item)) {
                      props.save(item);
                    }
                }} >Сохранить</Button>
            </ButtonGroup>
            <ButtonGroup className="me-2" >
                <Button onClick={() => props.cancel()}
                 >Отмена</Button>
            </ButtonGroup>
        </div>
        </>
      );
  }
  
  function AnswersDisplay(props) {
    return (
    <div>
        {props.answers.map((item, index) => {
          return (
            <div key={item.id}>
              <InputGroup className="mt-3 InputAnswers">
                <InputGroup.Checkbox aria-label="Checkbox for following text input" defaultChecked = {item.correct}
                onChange={(e) => props.updateAnswerCorrect(e.target.checked, index)}
                />
                <Form.Control placeholder="Введите ответ" defaultValue = {item.name}
                onChange={(e) => props.updateAnswerText(e.target.value, index)}
                isInvalid={props.validated && item.name.length == 0}
                />
                <CloseButton className="closeButton" onClick={() => props.deleteAnswer(index)}/>
                <Form.Control.Feedback type="invalid">Необходимо ввести текст ответа</Form.Control.Feedback>
              </InputGroup>
            </div>
          );
        })}
    </div>
    );
  }
  
export default QuestionPanel;
