<?php
/**
 * Script untuk otomatisasi earn coins di optiklink.com
 * Hanya untuk keperluan edukasi / testing keamanan.
 * Jangan digunakan untuk tujuan ilegal atau melanggar ToS.
 */

class OptikLinkAutoEarn
{
    private $baseUrl = "https://optiklink.com";
    private $cookies = [];
    private $userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36";
    private $sessionId;
    private $cfClearance;
    private $isRunning = true;

    public function __construct($sessionId, $cfClearance)
    {
        $this->sessionId = $sessionId;
        $this->cfClearance = $cfClearance;
        $this->cookies = [
            'PHPSESSID' => $this->sessionId,
            'cf_clearance' => $this->cfClearance,
            'theme' => 'light'
        ];
    }

    /**
     * Get cookies string for request header
     */
    private function getCookieString()
    {
        $cookieStr = '';
        foreach ($this->cookies as $name => $value) {
            $cookieStr .= "{$name}={$value}; ";
        }
        return rtrim($cookieStr, '; ');
    }

    /**
     * HTTP request dengan cURL
     */
    private function request($url, $method = 'GET', $data = [], $headers = [])
    {
        $ch = curl_init();
        
        $defaultHeaders = [
            'Host: optiklink.com',
            'User-Agent: ' . $this->userAgent,
            'Accept: */*',
            'Accept-Language: id-ID,id;q=0.5',
            'Accept-Encoding: gzip, deflate',
            'Connection: keep-alive',
            'Cookie: ' . $this->getCookieString(),
            'Sec-Fetch-Dest: empty',
            'Sec-Fetch-Mode: cors',
            'Sec-Fetch-Site: same-origin',
            'X-Requested-With: XMLHttpRequest',
        ];

        $finalHeaders = array_merge($defaultHeaders, $headers);

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if (!empty($data)) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            }
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $finalHeaders);
        curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return [
                'code' => 0,
                'body' => '',
                'error' => $error
            ];
        }
        
        curl_close($ch);

        return [
            'code' => $httpCode,
            'body' => $response,
            'error' => null
        ];
    }

    /**
     * Ambil jumlah coin saat ini
     */
    public function getCurrentCoins()
    {
        $url = $this->baseUrl . "/ol-earn-coins.php";
        $headers = [
            'Referer: ' . $this->baseUrl . '/earncoins',
            'Sec-Ch-Ua: "Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
            'Sec-Ch-Ua-Mobile: ?1',
            'Sec-Ch-Ua-Platform: "Android"',
            'Sec-Gpc: 1'
        ];

        $response = $this->request($url, 'GET', [], $headers);
        
        if ($response['code'] == 200) {
            preg_match('/(\d+)\s*coins?/', $response['body'], $matches);
            if (isset($matches[1])) {
                return (int) $matches[1];
            }
            $coins = trim($response['body']);
            if (is_numeric($coins)) {
                return (int) $coins;
            }
        }
        
        return false;
    }

    /**
     * Tampilkan progress bar
     */
    private function showProgressBar($current, $total, $length = 30)
    {
        $percent = ($total > 0) ? ($current / $total) : 0;
        $filled = floor($percent * $length);
        $empty = $length - $filled;
        
        $bar = "\033[42m" . str_repeat(" ", $filled) . "\033[0m";
        $bar .= "\033[41m" . str_repeat(" ", $empty) . "\033[0m";
        
        return $bar;
    }

    /**
     * Clear screen
     */
    private function clearScreen()
    {
        echo "\033[2J\033[;H"; // Clear screen and move to top
    }

    /**
     * Tampilkan header yang modern
     */
    private function showHeader()
    {
        $this->clearScreen();
        echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
        echo "\033[1;36m║\033[0m" . str_pad("🪙 OPTIKLINK AUTO EARNER", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
        echo "\033[1;36m║\033[0m" . str_pad("by DeepSeek", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
        echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n\n";
    }

    /**
     * Tampilkan box info
     */
    private function showBox($title, $content, $color = "36")
    {
        $lines = explode("\n", $content);
        echo "\033[1;{$color}m┌─ " . $title . " " . str_repeat("─", 56 - strlen($title)) . "┐\033[0m\n";
        
        foreach ($lines as $line) {
            echo "\033[1;{$color}m│\033[0m " . str_pad($line, 57, " ") . "\033[1;{$color}m │\033[0m\n";
        }
        
        echo "\033[1;{$color}m" . str_repeat("─", 60) . "\033[0m\n";
    }

    /**
     * Tampilkan status dengan format modern
     */
    private function showStatus($cycle, $coins, $startTime, $coinsEarned = 0, $waitTime = 60)
    {
        $currentTime = time();
        $elapsedTime = $currentTime - $startTime;
        
        // Format waktu
        $hours = floor($elapsedTime / 3600);
        $minutes = floor(($elapsedTime % 3600) / 60);
        $seconds = $elapsedTime % 60;
        
        $timeStr = sprintf("%02d:%02d:%02d", $hours, $minutes, $seconds);
        
        // Hitung coins per jam
        $coinsPerHour = ($elapsedTime > 0) ? round(($coins * 3600) / $elapsedTime, 2) : 0;
        
        // Tampilkan status box
        $statusContent = "";
        $statusContent .= "Cycle        : \033[1;33m#" . str_pad($cycle, 4, "0", STR_PAD_LEFT) . "\033[0m\n";
        $statusContent .= "Coins        : \033[1;32m" . number_format($coins) . " 🪙\033[0m\n";
        $statusContent .= "Session Time : \033[1;35m" . $timeStr . "\033[0m\n";
        $statusContent .= "Coins/Hour   : \033[1;36m" . number_format($coinsPerHour, 2) . " 🪙\033[0m\n";
        $statusContent .= "Last Earn    : \033[1;32m+" . $coinsEarned . " 🪙\033[0m";
        
        $this->showBox("📊 STATUS", $statusContent, "36");
    }

    /**
     * Tampilkan timer countdown dengan progress bar
     */
    private function showCountdown($seconds, $total = 60)
    {
        echo "\n\033[1;34m⏰ NEXT CYCLE IN:\033[0m \033[1;33m" . str_pad($seconds, 2, "0", STR_PAD_LEFT) . "s\033[0m\n";
        
        // Progress bar
        $progress = $total - $seconds;
        $progressPercent = ($progress / $total) * 100;
        
        echo "\033[1;37m[" . $this->showProgressBar($progress, $total, 40) . "]\033[0m ";
        echo "\033[1;36m" . number_format($progressPercent, 1) . "%\033[0m\n";
    }

    /**
     * Tampilkan log message
     */
    private function showLog($message, $type = 'info')
    {
        $timestamp = date('H:i:s');
        $icons = [
            'info' => '🔹',
            'success' => '✅',
            'warning' => '⚠️',
            'error' => '❌',
            'system' => '⚙️'
        ];
        
        $colors = [
            'info' => '36',
            'success' => '32',
            'warning' => '33',
            'error' => '31',
            'system' => '35'
        ];
        
        $icon = isset($icons[$type]) ? $icons[$type] : '🔹';
        $color = isset($colors[$type]) ? $colors[$type] : '37';
        
        echo "\033[1;{$color}m{$icon} [{$timestamp}] {$message}\033[0m\n";
    }

    /**
     * Refresh session
     */
    private function simulateRefresh()
    {
        $url = $this->baseUrl . "/earncoins";
        $headers = ['Referer: ' . $this->baseUrl, 'Sec-Gpc: 1'];

        $this->showLog("Refreshing session...", 'system');
        $response = $this->request($url, 'GET', [], $headers);
        
        if ($response['code'] == 200) {
            $this->showLog("Session refreshed successfully", 'success');
            return true;
        }
        
        $this->showLog("Refresh failed: HTTP {$response['code']}", 'error');
        return false;
    }

    /**
     * Cek koneksi
     */
    private function checkConnection()
    {
        $response = $this->request($this->baseUrl, 'GET');
        return $response['code'] == 200;
    }

    /**
     * Main earning loop
     */
    public function startContinuousEarning()
    {
        // Setup signal handler
        declare(ticks = 1);
        pcntl_signal(SIGINT, [$this, 'signalHandler']);
        pcntl_signal(SIGTERM, [$this, 'signalHandler']);
        
        $this->showHeader();
        $this->showLog("Starting Auto Earn Coins...", 'success');
        $this->showLog("Press Ctrl+C to stop", 'warning');
        echo "\n";
        
        sleep(2);
        
        $startTime = time();
        $lastRefreshTime = $startTime;
        $cycle = 0;
        $totalCoins = 0;
        $successfulCycles = 0;
        $failedCycles = 0;
        $lastCoinCount = 0;
        $totalEarned = 0;
        
        while ($this->isRunning) {
            $cycle++;
            
            // Clear dan show header setiap cycle
            $this->showHeader();
            
            // Cek koneksi setiap 10 cycles
            if ($cycle % 10 == 0) {
                $this->showLog("Checking connection...", 'system');
                if (!$this->checkConnection()) {
                    $this->showLog("Connection issue detected!", 'error');
                    $failedCycles++;
                    
                    // Tampilkan retry countdown
                    for ($i = 30; $i > 0 && $this->isRunning; $i--) {
                        $this->showHeader();
                        $this->showStatus($cycle, $totalCoins, $startTime, 0);
                        echo "\n\033[1;31m⚠️ Connection Error - Retrying in: {$i}s\033[0m\n";
                        sleep(1);
                    }
                    continue;
                }
            }
            
            // Auto refresh setiap 35 menit
            $currentTime = time();
            if (($currentTime - $lastRefreshTime) >= 2100) {
                $this->simulateRefresh();
                $lastRefreshTime = $currentTime;
            }
            
            // Get current coins
            $this->showLog("Cycle #{$cycle} - Fetching coins...", 'info');
            $currentCoins = $this->getCurrentCoins();
            
            if ($currentCoins !== false) {
                // Calculate earned coins
                $coinsEarned = ($cycle == 1) ? 0 : ($currentCoins - $lastCoinCount);
                $lastCoinCount = $currentCoins;
                $totalCoins = $currentCoins;
                $successfulCycles++;
                
                if ($coinsEarned > 0) {
                    $totalEarned += $coinsEarned;
                    $this->showLog("Earned +{$coinsEarned} coins!", 'success');
                }
                
                // Show status
                $this->showStatus($cycle, $currentCoins, $startTime, $coinsEarned);
                
                // Show statistics box
                $statsContent = "";
                $statsContent .= "Success Rate : \033[1;32m" . 
                    number_format(($successfulCycles / $cycle) * 100, 1) . "%\033[0m\n";
                $statsContent .= "Total Cycles : \033[1;33m" . $cycle . "\033[0m\n";
                $statsContent .= "Successful   : \033[1;32m" . $successfulCycles . "\033[0m\n";
                $statsContent .= "Failed       : \033[1;31m" . $failedCycles . "\033[0m\n";
                $statsContent .= "Total Earned : \033[1;32m" . $totalEarned . " 🪙\033[0m";
                
                $this->showBox("📈 STATISTICS", $statsContent, "35");
                
            } else {
                $this->showLog("Failed to fetch coins!", 'error');
                $failedCycles++;
                $this->showStatus($cycle, $totalCoins, $startTime, 0);
            }
            
            // Countdown untuk next cycle
            echo "\n";
            for ($i = 60; $i > 0 && $this->isRunning; $i--) {
                $this->showHeader();
                
                if ($currentCoins !== false) {
                    $this->showStatus($cycle, $currentCoins, $startTime, $coinsEarned ?? 0);
                    $this->showBox("📈 STATISTICS", $statsContent ?? "", "35");
                } else {
                    $this->showStatus($cycle, $totalCoins, $startTime, 0);
                }
                
                $this->showCountdown($i);
                
                // Show tips every 15 seconds
                if ($i % 15 == 0) {
                    $tips = [
                        "💡 Script runs automatically every 60 seconds",
                        "💡 Auto-refresh happens every 35 minutes",
                        "💡 You earn 2 coins per cycle",
                        "💡 Keep this window open to earn continuously"
                    ];
                    echo "\n\033[1;37m" . $tips[array_rand($tips)] . "\033[0m\n";
                }
                
                sleep(1);
            }
            
            if ($this->isRunning) {
                echo "\n";
                $this->showLog("Starting next cycle...", 'system');
                sleep(1);
            }
        }
        
        // Show summary
        $this->showSummary($startTime, $cycle, $successfulCycles, $failedCycles, $totalCoins, $totalEarned);
    }

    /**
     * Signal handler
     */
    public function signalHandler($signo)
    {
        $this->showLog("\n🛑 Stopping script...", 'warning');
        $this->isRunning = false;
    }

    /**
     * Show final summary
     */
    private function showSummary($startTime, $totalCycles, $successCycles, $failCycles, $totalCoins, $totalEarned)
    {
        $endTime = time();
        $totalDuration = $endTime - $startTime;
        
        $this->showHeader();
        
        echo "\033[1;35m" . str_repeat("★", 60) . "\033[0m\n";
        echo "\033[1;35m★\033[0m" . str_pad("📊 FINAL REPORT", 58, " ", STR_PAD_BOTH) . "\033[1;35m★\033[0m\n";
        echo "\033[1;35m" . str_repeat("★", 60) . "\033[0m\n\n";
        
        $summaryContent = "";
        $summaryContent .= "Start Time    : \033[1;36m" . date('Y-m-d H:i:s', $startTime) . "\033[0m\n";
        $summaryContent .= "End Time      : \033[1;36m" . date('Y-m-d H:i:s', $endTime) . "\033[0m\n";
        $summaryContent .= "Duration      : \033[1;35m" . $this->formatDuration($totalDuration) . "\033[0m\n";
        $summaryContent .= "Total Cycles  : \033[1;33m" . $totalCycles . "\033[0m\n";
        $summaryContent .= "Success Rate  : \033[1;32m" . 
            number_format(($successCycles / max(1, $totalCycles)) * 100, 1) . "%\033[0m\n";
        $summaryContent .= "Final Coins   : \033[1;32m" . number_format($totalCoins) . " 🪙\033[0m\n";
        $summaryContent .= "Total Earned  : \033[1;32m" . $totalEarned . " 🪙\033[0m\n";
        
        if ($totalDuration > 0) {
            $coinsPerHour = ($totalEarned / $totalDuration) * 3600;
            $summaryContent .= "Avg/Hour      : \033[1;36m" . number_format($coinsPerHour, 2) . " 🪙\033[0m";
        }
        
        $this->showBox("📋 SUMMARY", $summaryContent, "35");
        
        echo "\n\033[1;32m✅ Script completed successfully!\033[0m\n";
        echo "\033[1;37mThank you for using OptikLink Auto Earner\033[0m\n\n";
    }

    /**
     * Format duration for display
     */
    private function formatDuration($seconds)
    {
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        
        return sprintf("%02dh %02dm %02ds", $hours, $minutes, $secs);
    }

    /**
     * Test connection
     */
    public function testConnection()
    {
        $this->showHeader();
        $this->showLog("Testing connection...", 'system');
        
        echo "\n";
        $this->showBox("🔍 CONNECTION TEST", "Testing connection to OptikLink...", "36");
        
        // Test website connection
        $this->showLog("1. Connecting to optiklink.com...", 'info');
        $response = $this->request($this->baseUrl, 'GET');
        
        if ($response['code'] == 200) {
            $this->showLog("   ✅ Connection successful (HTTP 200)", 'success');
        } else {
            $this->showLog("   ❌ Connection failed (HTTP {$response['code']})", 'error');
            return false;
        }
        
        // Test earn coins endpoint
        $this->showLog("2. Testing earn coins access...", 'info');
        $coins = $this->getCurrentCoins();
        
        if ($coins !== false) {
            $this->showLog("   ✅ Access successful", 'success');
            $this->showLog("   Current coins: {$coins} 🪙", 'success');
            echo "\n";
            $this->showBox("🎯 READY TO EARN", "Your session is working perfectly!\nStart earning coins now!", "32");
            return true;
        }
        
        $this->showLog("   ❌ Failed to access earn coins", 'error');
        echo "\n";
        $this->showBox("⚠️ WARNING", "Check your session ID and cf_clearance\nMake sure they are up to date", "33");
        return false;
    }
}

// ==================== KONFIGURASI ====================
$sessionId = "ab8ethoh0fo2j26n9mdqc2nsl4";
$cfClearance = "6Z4RmrN9x_dL2ESN2j16d.5DhgBmBPImDjE9Nkk3U5Y-1769030885-1.2.1.1-Qc35MJIx6p1Cq8PT4mD_dJzMKsFi5tqON4FStf9RtNkVixfo7z.w52ozo2WSBAwRKgbzHoOoudIwJsh0oBZj6IlruT6KOqhjYRZl3uL4S48UfbAMeLGaJClFcTyEWfAgoKEgOsF6Vl58xI0FLcVyYTLxoBtPN1l8tiB6qdoqdwcUTEi.DIvtJoLUW1StUFNAzVhSzsh3eGacN3YJqBDaZ2gLGJM91Rv_EFeFhB40Oqk";

// ==================== MODERN MENU ====================
function showModernMenu()
{
    system('clear');
    
    // ASCII Art Header
    echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
    echo "\033[1;36m║\033[0m" . str_pad("🪙 OPTIKLINK AUTO EARNER", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
    echo "\033[1;36m║\033[0m" . str_pad("v2.0 • Modern Edition", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
    echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n\n";
    
    // Menu Options with icons
    $menu = [
        "🚀" => "Start Auto Earn (Continuous Mode)",
        "🔍" => "Test Connection & Session",
        "💰" => "Check Current Coins",
        "❌" => "Exit Program"
    ];
    
    $i = 1;
    foreach ($menu as $icon => $text) {
        echo "\033[1;37m[{$i}]\033[0m {$icon} \033[1;36m{$text}\033[0m\n";
        if ($i < count($menu)) {
            echo "\033[1;30m" . str_repeat("─", 60) . "\033[0m\n";
        }
        $i++;
    }
    
    echo "\n\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
    echo "\033[1;37mSelect option [1-4]: \033[0m";
    
    $handle = fopen("php://stdin", "r");
    $choice = trim(fgets($handle));
    fclose($handle);
    
    return $choice;
}

// ==================== MAIN PROGRAM ====================
$earner = new OptikLinkAutoEarn($sessionId, $cfClearance);

while (true) {
    $choice = showModernMenu();
    
    switch ($choice) {
        case '1':
            echo "\n";
            $earner->startContinuousEarning();
            echo "\n\033[1;37mPress Enter to continue...\033[0m";
            fgets(STDIN);
            break;
            
        case '2':
            echo "\n";
            if ($earner->testConnection()) {
                echo "\n\033[1;37mPress Enter to continue...\033[0m";
                fgets(STDIN);
            } else {
                echo "\n\033[1;31m⚠️ Connection failed!\033[0m\n";
                echo "\033[1;37mPress Enter to continue...\033[0m";
                fgets(STDIN);
            }
            break;
            
        case '3':
            echo "\n";
            $earner->showHeader();
            echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
            echo "\033[1;36m║\033[0m" . str_pad("💰 COIN CHECKER", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
            echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n\n";
            
            $coins = $earner->getCurrentCoins();
            if ($coins !== false) {
                echo "\033[1;32m✅ Current coins: \033[1;33m" . number_format($coins) . " 🪙\033[0m\n";
                
                // Show progress to next milestone
                $nextMilestone = ceil($coins / 1000) * 1000;
                $progress = ($coins % 1000);
                
                echo "\n\033[1;36mProgress to " . number_format($nextMilestone) . " coins:\033[0m\n";
                echo $earner->showProgressBar($progress, 1000, 40);
                echo " \033[1;33m" . $progress . "/1000\033[0m\n";
            } else {
                echo "\033[1;31m❌ Failed to fetch coins\033[0m\n";
            }
            
            echo "\n\033[1;37mPress Enter to continue...\033[0m";
            fgets(STDIN);
            break;
            
        case '4':
            echo "\n\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
            echo "\033[1;36m║\033[0m" . str_pad("👋 Thank you for using!", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
            echo "\033[1;36m║\033[0m" . str_pad("Goodbye! 👋", 58, " ", STR_PAD_BOTH) . "\033[1;36m║\033[0m\n";
            echo "\033[1;36m" . str_repeat("═", 60) . "\033[0m\n";
            exit(0);
            
        default:
            echo "\n\033[1;31m❌ Invalid option!\033[0m\n";
            sleep(2);
            break;
    }
}
?>