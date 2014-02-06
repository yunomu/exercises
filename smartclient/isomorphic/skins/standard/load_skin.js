/*
	Isomorphic SmartClient Skin File
	
	This file loads a 'skin' for your Isomorphic SmartClient applications.
	To load this skin, reference this file in a <SCRIPT> tag immediately
	after your Isomorphic SmartClient loader:
	
		<SCRIPT ...>


*/


isc.loadSkin = function (theWindow) {
if (theWindow == null) theWindow = window;
with (theWindow) {
	//
	//	Step 1:  Set the Isomorphic SmartClient skinDir to point to this directory
	//
	//			 NOTE: The path provided here MUST be relative to your application
	//					file or the already set up Isomorphic dir.
	//
	//			 ** If you move this skin, you must change the skinDir below!***
	//
	isc.Page.setSkinDir("[ISOMORPHIC]/skins/standard/");
	
	
	//
	//	Step 2:  Load the stylesheet (you can load app-specific stylesheets here, too, if you like)
	//
	isc.Page.loadStyleSheet("[SKIN]/skin_styles.css", theWindow);
	//
	//	Step 3: Customize the SmartClient client framework below
	//
	isc.Canvas.setProperties({
		// This skin includes custom scrollbars.
		// By default custom scrollbars are not enabled for Internet Explorer on Windows
		// and Mozilla on Mac / Unix / Linux systems.
		// For these browsers we use native CSS scrollbars, which improves performance, but may
		// not match the skin's "look and feel".
		// To force all browsers to use custom scrollbars for this skin, uncomment the following
		// line.
		showCustomScrollbars:true
	});

    if(isc.Browser.isIE && isc.Browser.version >= 7 && !isc.Browser.isIE9) {
        isc.Canvas.setAllowExternalFilters(false);
        isc.Canvas.setNeverUseFilters(true);
        if(isc.Window) {
          isc.Window.addProperties({
                modalMaskOpacity:null,
                modalMaskStyle:"normal"
            });
            isc.Window.changeDefaults("modalMaskDefaults", { src : "[SKIN]opacity.png" });
        }
    }

    // define IButton so examples that support the new SmartClient skin image-based
    // button will fall back on the CSS-based Button with this skin
	isc.ClassFactory.defineClass("IButton", "Button");
	isc.ClassFactory.defineClass("IAutoFitButton", "AutoFitButton");
    if (isc.IButton.markAsFrameworkClass != null) isc.IButton.markAsFrameworkClass();
    if (isc.IAutoFitButton.markAsFrameworkClass != null) isc.IAutoFitButton.markAsFrameworkClass();


    if (isc.Menu) {
        isc.Menu.addProperties({
            bodyStyleName:"menuMain"
        });
    }

	// ListGrid skinning	
	if (isc.ListGrid) {										  
		isc.ListGrid.addProperties({
			// copy the header (.button) background-color to match when sort arrow is hidden
			backgroundColor:"#DDDDDD",
            recordSummaryBaseStyle:"cell",
            expansionFieldImageWidth : 16,
            expansionFieldImageHeight : 16
		});
	}
    
    // Window skinning
    if (isc.Window) {
        isc.Window.addProperties({
            showFooter:false
        })
        // Dialog (prompt) shows no header in edge media - ensure message is centered.
        isc.Dialog.changeDefaults("bodyDefaults", 
            {layoutTopMargin:15, layoutLeftMargin:15, layoutRightMargin:15, layoutBottomMargin:15});
        isc.Dialog.changeDefaults("messageStackDefaults",
            {layoutMargin:10, layoutBottomMargin:10});
        
        isc.addProperties(isc.Dialog.Prompt.bodyDefaults,
            {layoutTopMargin:15, layoutBottomMargin:15, layoutLeftMargin:15, layoutRightMargin:15});
        isc.addProperties(isc.Dialog.Prompt.messageStackDefaults,
            {layoutMargin:10, layoutBottomMargin:10});

    }

    // DateChooser icons
    if (isc.DateChooser) {
        isc.DateChooser.addProperties({
            showDoubleYearIcon:false,
            skinImgDir:"images/DateChooser/"
        });        
    }

    // Calendar skinning
    if (isc.Calendar) {
        isc.Calendar.changeDefaults("datePickerButtonDefaults", {
            src:"[SKIN]/DynamicForm/date_control.png",
            showDown:false
        })
    }
    
	if (isc.TabSet) {
        // In Netscape Navigator 4.7x, set the backgroundColor directly since the css
        // background colors are not reliable
        if (isc.Browser.isNav) {
            isc.TabSet.addProperties({paneContainerDefaults:{backgroundColor:"#DDDDDD"}});
        }            
    }        
    
    // Default EdgedCanvas skinning (for any canvas where showEdges is set to true)
    if (isc.EdgedCanvas) {
        isc.EdgedCanvas.addProperties({
            edgeSize:3,
            edgeImage:"[SKIN]/square/frame/FFFFFF/3.png"
        })
    }
    
    // ToolStrip skinning
    if (isc.ToolStrip) {
        isc.ToolStrip.changeDefaults("dropLineDefaults", {
            className:"toolStripLayoutDropLine"
        });
    }
    
    // Dynamic form item skinning
    // Native FILE INPUT items are rendered differently in Safari from other browsers
    // Don't show standard textbox styling around them as it looks odd
    if (isc.UploadItem && isc.Browser.isSafari) {
        isc.UploadItem.addProperties({
            textBoxStyle:"normal"
        });
    }
    
    if (isc.ComboBoxItem) {
        isc.ComboBoxItem.addProperties({
            pendingTextBoxStyle:"comboBoxItemPendingText"
        });
    }
    if (isc.SpinnerItem) {
        isc.SpinnerItem.INCREASE_ICON = isc.addProperties(isc.SpinnerItem.INCREASE_ICON, {
            showOver:true
        });
        isc.SpinnerItem.DECREASE_ICON = isc.addProperties(isc.SpinnerItem.DECREASE_ICON, {
            showOver:true
        });
    }
    
    // Use standard MenuButton Class for IMenuButton
    if (isc.MenuButton && isc.IMenuButton) {
        isc.IMenuButton = isc.MenuButton;
    }
   
    // -------------------------------------------
    // Printing
    // -------------------------------------------
    if (isc.PrintWindow) {
        isc.PrintWindow.changeDefaults("printButtonDefaults", {
            height: 16
        });
    }

    // remember the current skin so we can detect multiple skins being loaded
    if (isc.setCurrentSkin) isc.setCurrentSkin("standard");
    
	//
	//  Step 4: Specify where the browser should redirect if the browser is
	// 			not supported.
	//
	isc.Page.checkBrowserAndRedirect("[SKIN]/unsupported_browser.html");
}
}


// call the loadSkin routine to initialize the skin
isc.loadSkin()

