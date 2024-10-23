import Modal from 'react-bootstrap/Modal'; 
import Button from "react-bootstrap/Button";

function MessageBoxModal(props) {
    return (
    <div>
        <Modal
            show={props.show}
            onHide={props.onCancel}
            backdrop="static"
            keyboard={true}
        >
        <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {props.query} 
        </Modal.Body>
        <Modal.Footer>
        <Button variant="secondary" onClick={props.onCancel}>{props.cancelButton}</Button>
        <Button variant="primary" onClick={props.OnOk}>{props.okButton}</Button>
        </Modal.Footer>
        </Modal>
      </div>
    );
  }
  
export default MessageBoxModal;
