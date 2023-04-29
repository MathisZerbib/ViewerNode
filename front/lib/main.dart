import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:front/providers/view.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<ViewProvider>(
          create: (_) => ViewProvider(),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'TikTok Bot',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _message = '';
  bool _isConnected = false;
  String _errorMessage = '';

  void _connectSocket() async {
    try {
      // connect to socket here
      // if successful, set _isConnected to true
      _isConnected = true;
    } catch (e) {
      // if connection fails, set _isConnected to false and set _errorMessage
      _isConnected = false;
      _errorMessage = e.toString();
    }
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    _connectSocket();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isConnected) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Video Youtube Bot'),
          centerTitle: true,
        ),
        body: Center(
          child: Text(
            'Failed to connect to socket: $_errorMessage',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18.0,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    ViewProvider provider = context.watch<ViewProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Video Youtube Bot'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16.0),
              const Text(
                'Enter the TikTok video URL',
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8.0),
              TextField(
                onChanged: (e) => _message = e,
                decoration: const InputDecoration(
                  hintText:
                      'https://www.tiktok.com/@username/video/1234567890123456',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16.0),
              ElevatedButton(
                child: const Text('Start Bot'),
                onPressed: () {
                  if (_message.isNotEmpty) {
                    provider.sendMessage(_message);
                  }
                },
              ),
              const SizedBox(height: 16.0),
              ElevatedButton(
                child: const Text('Stop Bot'),
                onPressed: () {
                  provider.stopBot();
                },
              ),
              if (provider.response != null)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Text(
                    '${provider.response!} started on $_message',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
