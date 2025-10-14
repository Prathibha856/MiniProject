import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for web
AppRegistry.registerComponent('main', () => App);

AppRegistry.runApplication('main', {
  rootTag: document.getElementById('root'),
});
