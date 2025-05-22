import styled from 'styled-components';

// Updated AlertMessage with toast styles
const AlertMessage = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  background-color: #f44336; /* red */
  color: white;
  border-radius: 4px;
  font-weight: bold;
  z-index: 1000; /* Ensure it appears above other content */
  opacity: 0;
  transform: translateY(100px); /* Start below the viewport */
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;

  &.show {
    opacity: 1;
    transform: translateY(0); /* Slide up to visible position */
  }
`;

export default AlertMessage;