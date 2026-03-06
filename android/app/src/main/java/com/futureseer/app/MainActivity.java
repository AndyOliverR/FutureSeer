package com.futureseer.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable third-party cookies for Firebase Auth redirects
        final CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);

        // Enable support for multiple windows (popups) which Firebase Auth often requires
        final WebSettings webSettings = getBridge().getWebView().getSettings();
        webSettings.setSupportMultipleWindows(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
    }
}
