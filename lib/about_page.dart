import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});
  final String version = '1.2.2';
  final String link = 'https://github.com/kryptech/Glower';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('About Glowr Light'),
        backgroundColor: Colors.red,
      ),
      backgroundColor: Colors.red,
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Illuminate the darkness with adjustable red screen glow.\nv$version\nBy Chris M. Sissons',
              style: const TextStyle(fontSize: 16),
            ),
            InkWell(
              onTap: () {
                _launchURL(Uri.parse(link));
              },
              child: Text(
                link,
                style: const TextStyle(fontSize: 16),
              ),
            ),
            const Text(
              '\nHow to Use',
              style: TextStyle(fontSize: 20),
            ),
            const Text(
              'Slide or tap your finger on the screen to adjust the brightness - the top is light and the bottom is dark. The edges of the screen are a "dead zone" (shown in darker colour here) to prevent accidental adjustments while holding your device.\nTap the top ? to open this screen.',
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}

_launchURL(Uri uri) async {
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  }
}
