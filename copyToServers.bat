robocopy "c:\sourcen\Main\projects\Web\OMNIClient" "\\cas-ew-caesar-1\c$\caesar\prog\CAEWebSrv\web\Timio" *.* /XD "test" /S
robocopy "c:\sourcen\Main\projects\Web\Shared" "\\cas-ew-caesar-1\c$\caesar\prog\CAEWebSrv\web\Shared" *.* /S

robocopy "c:\sourcen\Main\projects\Web\OMNIClient" "\\cas-ew-caesar-3\caesarAPP\CAEWebSrv\web\Timio" *.* /XD "test" /S
robocopy "c:\sourcen\Main\projects\Web\Shared" "\\cas-ew-caesar-3\caesarAPP\CAEWebSrv\web\Shared" *.* /S
