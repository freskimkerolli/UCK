import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const SITE_URL = 'https://uck-five.vercel.app';
const BRAND_RED = '#E0011E';

export default function App() {
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const canGoBack = useRef(false);

  const handleNavigationChange = (navState: WebViewNavigation) => {
    canGoBack.current = navState.canGoBack;
  };

  const handleRetry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack.current) {
        webviewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <WebView
          key={reloadKey}
          ref={webviewRef}
          source={{ uri: SITE_URL }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          startInLoadingState
          allowsBackForwardNavigationGestures
          decelerationRate="normal"
          incognito={false}
          cacheEnabled
          renderError={(_errorDomain, _errorCode, errorDesc) => (
            <View style={styles.offlineContainer}>
              <Text style={styles.offlineTitle}>UÇK Connect</Text>
              <Text style={styles.offlineHeadline}>S&apos;ka lidhje me internetin</Text>
              <Text style={styles.offlineSubtitle}>{errorDesc}</Text>
              <Pressable style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Provo përsëri</Text>
              </Pressable>
            </View>
          )}
        />
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={BRAND_RED} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BRAND_RED,
    marginBottom: 24,
  },
  offlineHeadline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  offlineSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: BRAND_RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
