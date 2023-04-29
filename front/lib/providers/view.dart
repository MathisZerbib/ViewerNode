import 'dart:io';

import 'package:flutter/foundation.dart';
// import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class ViewProvider extends ChangeNotifier {
  String? message;
  String? response;
  int _viewCount = 0;

  int getViewCount() {
    return _viewCount;
  }

  void incrementViewCount() {
    _viewCount++;
    notifyListeners();
  }

  // This function will send the message to our backend.
  void sendMessage(msg) {
    WebSocketChannel? channel;
    // We use a try - catch statement, because the connection might fail.
    try {
      // Connect to our backend.
      String url;
      if (kIsWeb) {
        // For web, use a relative URL
        url = 'wss://viewer-node.onrender:3000';
      } else {
        // For mobile, use a platform-specific IP address
        if (Platform.isAndroid) {
          url = 'wss://viewer-node.onrender:3000'; // For Android emulator
        } else {
          url = 'wss://viewer-node.onrender:3000'; // For iOS simulator
        }
      }
      channel = WebSocketChannel.connect(Uri.parse(url));
    } catch (e) {
      // If there is any error that might be because you need to use another connection.
      print("Error on connecting to websocket: $e");
    }
    // Send message to backend
    channel?.sink.add(msg);

    // Listen for any message from backend
    channel?.stream.listen((event) {
      // Just making sure it is not empty
      if (event!.isNotEmpty) {
        print(event);
        response = event;
        // Update the UI
        // Now only close the connection and we are done here!
        channel!.sink.close();
        notifyListeners();
      }
    });
  }

  void setResponse(String? response) {
    response = response;
    notifyListeners();
  }

  void stopBot() {
    WebSocketChannel? channel;
    // We use a try - catch statement, because the connection might fail.
    try {
      // Connect to our backend.
      String url;
      if (kIsWeb) {
        // For web, use a relative URL
        url = 'wss://viewer-node.onrender.com:10000';
      } else {
        // For mobile, use a platform-specific IP address
        if (Platform.isAndroid) {
          url = 'wss://viewer-node.onrender.com:10000'; // For Android emulator
        } else {
          url = 'wss://viewer-node.onrender.com:10000'; // For iOS simulator
        }
      }
      channel = WebSocketChannel.connect(Uri.parse(url));
    } catch (e) {
      // If there is any error that might be because you need to use another connection.
      print("Error on connecting to websocket: $e");
    }
    channel?.sink.add('stop');
    channel?.stream.listen((event) {
      // Just making sure it is not empty
      if (event!.isNotEmpty) {
        print(event);
        response = event;
        // Update the UI
        // Now only close the connection and we are done here!
        channel!.sink.close();
        notifyListeners();
      }
    });
  }
}
