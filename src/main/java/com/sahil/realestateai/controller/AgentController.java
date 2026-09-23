package com.sahil.realestateai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
public class AgentController {
	
	@GetMapping("/test")
	public String test() {
		return "Agent API is working fine";
	}

}
