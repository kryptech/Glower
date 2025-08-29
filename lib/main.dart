import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:screen_brightness/screen_brightness.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:glowr/about_page.dart';

void main() {
  runApp(const MyApp());
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky); // Fullscreen
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    WakeLockPlus.enable();
    return MaterialApp(
      theme: ThemeData(
        // This is the theme of your application.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.red),
        useMaterial3: true,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> with SingleTickerProviderStateMixin {
  late AnimationController controller;
  late Animation animation;
  /// From 0 to 1
  double position = .3;
  bool guideRunning = true;
  late Color colour;

  @override
  void initState() {
    super.initState();
    controller =
      AnimationController(duration: const Duration(milliseconds: 2500), vsync: this)
      ..forward();
    animation = Tween<double>(
      begin: position,
      end: .7,
    ).animate(controller)
    ..addListener(() {
      updatePosition(animation.value);
    })
    ..addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        controller.reverse();
      } else if (status == AnimationStatus.dismissed) { // Done
        guideRunning = false;
      }
    });
    updatePosition(position);
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      floatingActionButtonLocation: FloatingActionButtonLocation.centerTop,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Opacity(
          opacity: .2,
          child: FloatingActionButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AboutPage()),
              );
            },
            backgroundColor: position < .5 ? Colors.black : Colors.white,
            child: Icon(
              Icons.question_mark,
              color: position >= .5 ? Colors.black : Colors.white,
            ),
          ),
        ),
      ),
      body: AnimatedContainer(
        decoration: BoxDecoration(
          color: colour,
        ),
        duration: Duration(milliseconds: guideRunning ? 1000 : 250),
        curve: Curves.easeOut,
        child: Column(
          children: [
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(MediaQuery.of(context).size.width * .12),
                child: GestureDetector(
                  onTapDown: (details) {
                    dragUpdate(details.localPosition.dy, MediaQuery.of(context).size);
                  },
                  onVerticalDragUpdate: (details) {
                    dragUpdate(details.localPosition.dy, MediaQuery.of(context).size);
                  },
                  child: AnimatedContainer(
                    decoration: BoxDecoration(
                      color: colour,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: colour,
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    duration: const Duration(milliseconds: 100),
                    curve: Curves.easeOut,
                    child: getGuideIcon(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  dragUpdate(double y, Size contextSize) {
    if (controller.isAnimating) {
      controller.stop(canceled: true);
      guideRunning = false;
    }
    double height = contextSize.height - contextSize.width * .04 * 2;
    updatePosition(1 - clampDouble(y / height, 0, 1));
  }

  updatePosition(double newPosition) {
    setState(() {
      position = newPosition;
      double saturation;
      double value;
      if (position < .5) {
        saturation = 1;
        value = clampDouble(position * 2, 0, 1);
      } else {
        saturation = 1 - (position * 2 - 1);
        value = 1;
      }
      HSVColor c = HSVColor.fromAHSV(1, 0, saturation, value);
      colour = c.toColor();
    });
    setApplicationBrightness(position);
  }

  getGuideIcon() {
    if (!guideRunning) {
      return null;
    }
    return Container(
      alignment: Alignment(0, (1 - position) * 2 - 1),
      constraints: const BoxConstraints.expand(),
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
      ),
      child: Icon(
        controller.status == AnimationStatus.forward ?
          Icons.arrow_upward_rounded
          : Icons.arrow_downward_rounded,
        size: 50,
      ),
    );
  }

  Future<void> setApplicationBrightness(double brightness) async {
    try {
      await ScreenBrightness.instance
        .setApplicationScreenBrightness(brightness);
    } catch (e) {
      debugPrint(e.toString());
      //throw 'Failed to set application brightness';
    }
  }
}
