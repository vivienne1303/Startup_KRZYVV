package app.teenlaunch.mobile;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TeenLaunchPrintPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
