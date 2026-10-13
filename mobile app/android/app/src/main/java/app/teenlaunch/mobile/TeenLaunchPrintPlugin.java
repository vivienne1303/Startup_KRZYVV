package app.teenlaunch.mobile;

import android.content.Context;
import android.print.PrintManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TeenLaunchPrint")
public class TeenLaunchPrintPlugin extends Plugin {
    @PluginMethod
    public void print(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            try {
                PrintManager manager = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                if (manager == null) {
                    call.reject("Android printing is unavailable on this device.");
                    return;
                }
                manager.print("TeenLaunch portfolio",
                    getBridge().getWebView().createPrintDocumentAdapter("TeenLaunch portfolio"), null);
                call.resolve(new JSObject());
            } catch (Exception error) {
                call.reject("Could not open Android printing.", error);
            }
        });
    }
}
